"""RS3M vs. RS12M auf Theme-Ebene. Liest den Parquet-Cache, schreibt out/*.csv und out/results.md."""
import json

import numpy as np
import pandas as pd
from scipy.stats import rankdata, spearmanr

from common import CACHE, MIN_MEMBERS, MIN_N, OUT, PERIODS, STEP, load_themes

OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(42)

# ---------------------------------------------------------------- Daten
close = pd.read_parquet(CACHE / "close.parquet")
member = pd.read_parquet(CACHE / "member.parquet").reindex(columns=close.columns, fill_value=False)
smap = json.loads((CACHE / "symbol_map.json").read_text())
missing = json.loads((CACHE / "missing_theme_tickers.json").read_text())
dates = close.index

# ---------------------------------------------------------------- RS
r = {n: close / close.shift(n) - 1 for n in (63, 126, 189, 252)}
raw12 = 0.4 * r[63] + 0.2 * r[126] + 0.2 * r[189] + 0.2 * r[252]
raw3 = r[63]


def pct_rank(raw):
    return raw.where(member).rank(axis=1, pct=True) * 100


rk12 = pct_rank(raw12).shift(1)   # Wert vom Vortag (kein Look-ahead)
rk3 = pct_rank(raw3).shift(1)
valid = rk12.notna() & rk3.notna()
rk12, rk3 = rk12.where(valid), rk3.where(valid)

first = int(np.argmax(valid.any(axis=1).values))
pos = np.arange(first + 1, len(dates), STEP)           # Stichtage
sd = dates[pos]
K = len(pos)
A12, A3 = rk12.values[pos], rk3.values[pos]

# Forward-Returns (delistete Titel: letzter Kurs fortgeschrieben)
cf = close.ffill()
fwd = {h: (cf.shift(-h) / cf - 1).where(close.notna()).values[pos] for h in (20, 60)}
vm = (member & valid).values[pos]
bench = {h: np.array([np.nanmedian(fwd[h][k][vm[k]]) for k in range(K)]) for h in (20, 60)}

# ---------------------------------------------------------------- Themes
themes = load_themes()
col = {c: i for i, c in enumerate(close.columns)}
names, idxs, used = [], [], {}
for t, tick in themes.items():
    ix = [col[smap[x]] for x in tick if x in smap and smap[x] in col]
    names.append(t)
    idxs.append(np.array(ix, dtype=int))
    used[t] = (len(tick), len(ix))
J = len(names)
S12, S3, NN = (np.full((K, J), np.nan) for _ in range(3))
EX = {h: np.full((K, J), np.nan) for h in (20, 60)}
LD_NOW, LD_LATER = np.full((K, J), np.nan), np.full((K, J), np.nan)
LAG = 60 // STEP
for j, ix in enumerate(idxs):
    a12, a3 = A12[:, ix], A3[:, ix]
    ok = ~np.isnan(a12)
    n = ok.sum(1)
    NN[:, j] = n
    with np.errstate(all="ignore"):
        m12, m3 = np.nanmedian(a12, 1), np.nanmedian(a3, 1)
        for h in (20, 60):
            f = np.where(ok, fwd[h][:, ix], np.nan)
            EX[h][:, j] = np.nanmedian(f, 1) - bench[h]
    elig = n >= MIN_MEMBERS
    S12[elig, j], S3[elig, j] = m12[elig], m3[elig]
    for k in range(K - LAG):
        both = ok[k] & ~np.isnan(a12[k + LAG])
        if elig[k] and both.sum() >= MIN_MEMBERS:
            def lead(row):
                return ((A12[row][ix][both] >= 95) | (A3[row][ix][both] >= 95)).mean()
            LD_NOW[k, j], LD_LATER[k, j] = lead(k), lead(k + LAG)
for h in EX:
    EX[h][np.isnan(S12)] = np.nan


def trank(S):
    R = np.full_like(S, np.nan)
    for k in range(K):
        v = ~np.isnan(S[k])
        if v.sum():
            R[k, v] = rankdata(-S[k, v], method="min")
    return R


R12, R3 = trank(S12), trank(S3)
NT = np.sum(~np.isnan(S12), 1)[:, None] * np.ones((1, J))
T12, T3 = R12 <= 10, R3 <= 10
V = ~np.isnan(S12)
period_k = {p: (sd >= a) & (sd <= b) for p, (a, b) in PERIODS.items()}
period_k["Gesamt"] = np.asarray(sd >= "2011-01-01")


def md(df, floatfmt="{:.2f}"):
    if df.empty:
        return "_leer_"
    cols = [df.index.name or ""] + list(df.columns)
    lines = ["| " + " | ".join(map(str, cols)) + " |", "|" + "---|" * len(cols)]
    for i, row in df.iterrows():
        cells = [str(i)]
        for x in row:
            if isinstance(x, (float, np.floating)):
                cells.append("" if np.isnan(x) else floatfmt.format(x))
            else:
                cells.append(str(x))
        lines.append("| " + " | ".join(cells) + " |")
    return "\n".join(lines)


def boot(sums, cnts, sums2=None, cnts2=None, block=12, B=2000):
    """Block-Bootstrap ueber Stichtage; Mittelwert (bzw. Differenz zweier Gruppen) mit 95%-KI."""
    n = len(sums)
    if n < block + 1 or cnts.sum() == 0:
        return np.nan, np.nan
    nb = int(np.ceil(n / block))
    res = np.empty(B)
    for b in range(B):
        st = rng.integers(0, n - block + 1, nb)
        ix = (st[:, None] + np.arange(block)).ravel()[:n]
        m = sums[ix].sum() / max(cnts[ix].sum(), 1)
        if sums2 is not None:
            m -= sums2[ix].sum() / max(cnts2[ix].sum(), 1)
        res[b] = m
    return np.percentile(res, 2.5), np.percentile(res, 97.5)


def label(rows):
    """rows: je Teilperiode (n, mean, lo, hi).
    validiert = in beiden Perioden n>=30, KI schliesst 0 aus, gleiches Vorzeichen;
    fragil = n<30 oder nur in einer Periode signifikant; sonst deskriptiv."""
    if any(n < MIN_N for n, *_ in rows):
        return "fragil"
    sig = [(lo > 0) or (hi < 0) for _, _, lo, hi in rows]
    sign = {np.sign(m) for _, m, _, _ in rows}
    if all(sig) and len(sign) == 1:
        return "validiert"
    if any(sig):
        return "fragil"
    return "deskriptiv"


out = []


def section(t):
    out.append(f"\n## {t}\n")


# ---------------------------------------------------------------- Meta
section("0. Datenbasis")
meta = pd.DataFrame({"Wert": [
    f"{close.shape[1]} Symbole mit Kursen, {int(member.any().sum())} davon je R3000-Mitglied",
    f"{K} Stichtage ({sd[0].date()} bis {sd[-1].date()}), jeder {STEP}. Handelstag",
    f"{J} Themes, {sum(v[0] for v in used.values())} Zuordnungen, davon {sum(v[1] for v in used.values())} mit Kursdaten",
    f"Theme-Ticker unbekannt bei Norgate (uebersprungen): {', '.join(missing) or 'keine'}",
    f"Themes mit >= {MIN_MEMBERS} gerankten Mitgliedern: im Mittel {np.mean(V.sum(1)):.1f} von {J} je Stichtag; "
    f"mittlere Mitgliederzahl/Theme {np.nanmean(NN[V]):.1f}"]},
    index=["Kurse", "Stichtage", "Themes", "Unbekannt", "Abdeckung"])
meta.index.name = ""
out.append(md(meta))

# ---------------------------------------------------------------- 1
section("1. Ueberschneidung RS3M vs. RS12M (Theme-Rang)")
rows = {}
sp = np.array([spearmanr(S3[k][V[k]], S12[k][V[k]])[0] if V[k].sum() > 5 else np.nan for k in range(K)])
o5 = np.array([np.sum((R3[k] <= 5) & (R12[k] <= 5)) for k in range(K)])
o10 = np.array([np.sum(T3[k] & T12[k]) for k in range(K)])
for p, m in period_k.items():
    rows[p] = {"Stichtage": float(m.sum()), "Spearman (Mittel)": np.nanmean(sp[m]), "Spearman (Median)": np.nanmedian(sp[m]),
               "Top-5 Schnittmenge (von 5)": o5[m].mean(), "Top-10 Schnittmenge (von 10)": o10[m].mean()}
t1 = pd.DataFrame(rows).T
t1.index.name = "Periode"
out.append(md(t1))
t1.to_csv(OUT / "a1_overlap.csv")

# ---------------------------------------------------------------- 2
section("2. Vorlauf: neu in RS3M-Top-10 (nicht in RS12M-Top-10) -> erreicht RS12M-Top-10 binnen 250 Handelstagen")
H = 250 // STEP
ev = np.zeros((K, J), bool)
ev[1:] = T3[1:] & ~T3[:-1] & ~T12[1:] & V[1:] & V[:-1]
base = ~T12 & V


def reach(k, j):
    w = T12[k + 1:k + 1 + H, j]
    return (int(np.argmax(w)) + 1) * STEP if w.any() else np.nan


rows = {}
for p, m in period_k.items():
    for nm, mask in (("Neu in RS3M-Top-10", ev), ("Basis: alle Themes ausserhalb RS12M-Top-10", base)):
        kk, jj = np.where(mask & m[:, None])
        keep = kk + H < K                      # kein Rechts-Censoring
        d = np.array([reach(k, j) for k, j in zip(kk[keep], jj[keep])])
        n = len(d)
        rows[(p, nm)] = {"Faelle": float(n), "versch. Themes": float(len(set(jj[keep]))),
                         "erreicht RS12-Top-10 in 250T (%)": 100 * np.mean(~np.isnan(d)) if n else np.nan,
                         "erreicht in 60T (%)": 100 * np.mean(d <= 60) if n else np.nan,
                         "Median Tage bis dahin": np.nanmedian(d) if n and (~np.isnan(d)).any() else np.nan,
                         "Hinweis": "n<30" if n < MIN_N else ""}
t2 = pd.DataFrame(rows).T
t2.index.names = ["Periode", "Gruppe"]
out.append(md(t2.reset_index().set_index("Periode")))
t2.to_csv(OUT / "a2_leadtime.csv")


# ---------------------------------------------------------------- 3
def stats_table(groups, title, csv, pairs=()):
    res, lab_in = [], {}
    for g, mask in groups.items():
        for h in (20, 60):
            ex = EX[h]
            for p, m in period_k.items():
                mm = mask & m[:, None] & ~np.isnan(ex)
                n = int(mm.sum())
                sums, cnts = np.where(mm, ex, 0).sum(1)[m], mm.sum(1)[m]
                lo, hi = boot(sums, cnts) if n else (np.nan, np.nan)
                v = ex[mm]
                res.append({"Gruppe": g, "Horizont": f"{h}T", "Periode": p, "Faelle": float(n),
                            "Exzess Mittel (%)": 100 * v.mean() if n else np.nan,
                            "Exzess Median (%)": 100 * np.median(v) if n else np.nan,
                            "KI95 lo": 100 * lo, "KI95 hi": 100 * hi,
                            "Trefferquote (%)": 100 * (v > 0).mean() if n else np.nan,
                            "Hinweis": "n<30 - nicht interpretieren" if n < MIN_N else ""})
                if p != "Gesamt":
                    lab_in.setdefault((g, h), []).append((n, v.mean() if n else 0, lo, hi))
    df = pd.DataFrame(res)
    df.to_csv(OUT / csv, index=False)
    out.append(f"\n**{title}** (Exzess = Theme-Median-Return minus Median aller R3000-Aktien; KI = Block-Bootstrap, Blocklaenge 12 Stichtage)\n")
    out.append(md(df.set_index("Gruppe")))
    drows = []
    for a, b in pairs:
        for h in (20, 60):
            ex = EX[h]
            ma, mb = groups[a] & ~np.isnan(ex), groups[b] & ~np.isnan(ex)
            labrows, first_row = [], len(drows)
            for p, m in period_k.items():
                sa, ca = np.where(ma, ex, 0).sum(1)[m], ma.sum(1)[m]
                sb, cb = np.where(mb, ex, 0).sum(1)[m], mb.sum(1)[m]
                d = sa.sum() / max(ca.sum(), 1) - sb.sum() / max(cb.sum(), 1)
                lo, hi = boot(sa, ca, sb, cb)
                nmin = min(ca.sum(), cb.sum())
                drows.append({"Differenz": f"{a} minus {b}", "Horizont": f"{h}T", "Periode": p, "n (kleinere Gruppe)": float(nmin),
                              "Delta Exzess (%-Pkt)": 100 * d, "KI95 lo": 100 * lo, "KI95 hi": 100 * hi, "Label": ""})
                if p != "Gesamt":
                    labrows.append((nmin, d, lo, hi))
            drows[-1]["Label"] = label(labrows)
    if drows:
        dd = pd.DataFrame(drows)
        out.append("\n**Differenzen (gepaart ueber Stichtage; Label = Bewertung ueber beide Teilperioden, steht in der Zeile 'Gesamt')**\n")
        out.append(md(dd.set_index("Differenz")))
        dd.to_csv(OUT / csv.replace(".csv", "_diff.csv"), index=False)


section("3. Persistenz / Vorhersagekraft (Forward-Exzess)")
groups3 = {"Alle Themes": V, "Nur RS3M-Top-10": T3 & ~T12, "Nur RS12M-Top-10": T12 & ~T3, "Beide Top-10": T3 & T12,
           "RS3M-Top-10 (gesamt)": T3, "RS12M-Top-10 (gesamt)": T12}
stats_table(groups3, "Forward-Exzess nach Gruppe", "a3_forward.csv",
            pairs=[("RS3M-Top-10 (gesamt)", "RS12M-Top-10 (gesamt)"), ("Nur RS3M-Top-10", "Nur RS12M-Top-10"),
                   ("Beide Top-10", "Alle Themes"), ("Nur RS3M-Top-10", "Alle Themes"), ("Nur RS12M-Top-10", "Alle Themes")])

pct3 = 100 * (1 - (R3 - 1) / np.maximum(NT - 1, 1))
pct12 = 100 * (1 - (R12 - 1) / np.maximum(NT - 1, 1))
rows = {}
later = np.minimum(np.arange(K) + LAG, K - 1)
for g, mask in (("RS3M-Top-10", T3), ("RS12M-Top-10", T12), ("Beide", T3 & T12)):
    for p, m in period_k.items():
        sel = mask & m[:, None] & (np.arange(K) < K - LAG)[:, None] & V[later]
        kk, jj = np.where(sel)
        rows[(g, p)] = {"Faelle": float(len(kk)),
                        "Perzentil RS3M-Rang +60T": pct3[kk + LAG, jj].mean() if len(kk) else np.nan,
                        "Perzentil RS12M-Rang +60T": pct12[kk + LAG, jj].mean() if len(kk) else np.nan,
                        "Basis": 50.0}
t3b = pd.DataFrame(rows).T
t3b.index.names = ["Gruppe", "Periode"]
out.append("\n**Rang-Persistenz: Theme-Perzentil 60 Handelstage spaeter (Vorstudie: 52-53 vs. 50,5)**\n")
out.append(md(t3b.reset_index().set_index("Gruppe")))
t3b.to_csv(OUT / "a3b_persistence.csv")

# ---------------------------------------------------------------- 4 + 5
section("4. Rising / Confirmed / Fading")
gap = R12 - R3
quart = np.floor(NT / 4)
classes = {"Rising X=5": gap >= 5, "Rising X=10": gap >= 10, "Rising X=N/4 (=10 bei 40 Themes)": gap >= quart,
           "Confirmed (beide Top-10)": T3 & T12, "Fading (RS12 Top-10, RS3M > 20)": T12 & (R3 > 20)}
classes = {k: v & V for k, v in classes.items()}
classes["Alle Themes"] = V
stats_table(classes, "Forward-Exzess und Trefferquote nach Klasse", "a4_classes.csv",
            pairs=[("Rising X=10", "Alle Themes"), ("Confirmed (beide Top-10)", "Alle Themes"),
                   ("Fading (RS12 Top-10, RS3M > 20)", "Alle Themes"),
                   ("Fading (RS12 Top-10, RS3M > 20)", "Confirmed (beide Top-10)")])

section("5. Leader-Bezug: Anteil Aktien mit RS12 >= 95 oder RS3M >= 95 (heute vs. +60 Handelstage)")
rows = {}
for g, mask in classes.items():
    for p, m in period_k.items():
        sel = mask & m[:, None] & ~np.isnan(LD_NOW)
        n = int(sel.sum())
        rows[(g, p)] = {"Faelle": float(n), "Anteil heute (%)": 100 * LD_NOW[sel].mean() if n else np.nan,
                        "Anteil +60T (%)": 100 * LD_LATER[sel].mean() if n else np.nan,
                        "Delta (%-Pkt)": 100 * (LD_LATER[sel] - LD_NOW[sel]).mean() if n else np.nan,
                        "Hinweis": "n<30 - nicht interpretieren" if n < MIN_N else ""}
t5 = pd.DataFrame(rows).T
t5.index.names = ["Klasse", "Periode"]
out.append(md(t5.reset_index().set_index("Klasse")))
t5.to_csv(OUT / "a5_leaders.csv")

# ---------------------------------------------------------------- Bias
section("Bias-Kontrolle")
out.append(
    "- **Survivorship / Look-ahead (Themes):** `docs/data/theme_constituents.json` wurde erstmals am 2026-10-03 committed (3 Commits, alle 2026-10-03); "
    "die Zusammenstellung stammt 1:1 von den heutigen Finviz-Themes. Ein Erstellungsdatum je Theme ist aus der Git-History **nicht nachvollziehbar** "
    "-> der Zeitraum ab Erstellung kann nicht separat gezeigt werden. **Alle Ergebnisse tragen den Hindsight-Bias** "
    "(heutige Mitglieder = oft heutige Gewinner; Theme-Auswahl nach heutiger Relevanz).\n"
    "- **Preise:** Norgate TR-adjustiert inkl. Delistings; Mitgliedschaft Russell 3000 zeitpunktgenau. Delistete Titel werden im Forward-Return zum letzten Kurs gehalten.\n"
    "- **Theme-Mitglieder** zaehlen nur an Tagen, an denen sie R3000-Mitglied sind und 252 Tage Historie haben (Theme-Aktien ausserhalb R3000 fallen heraus).\n"
    "- **Mindestgroessen:** Zellen mit < 30 Faellen sind markiert; Faelle ueberlappen (Forward 20/60T bei 5T-Raster) -> KI per Block-Bootstrap (12 Stichtage).\n"
    "- **Label-Regel:** validiert = in beiden Teilperioden n>=30, KI95 schliesst 0 aus, gleiches Vorzeichen; fragil = n<30 oder nur in einer Periode signifikant; sonst deskriptiv."
)
(OUT / "results.md").write_text("# RS3M vs. RS12M - Ergebnisse (automatisch erzeugt)\n" + "\n".join(out), encoding="utf-8")
print("\n".join(out))
