/** Filter lifetime spend-stats payload on the client (no extra /stats request). */
export function filterSpendStats(stats, category, subcategory) {
  const cat = category && category !== "All" ? category : null;
  const sub = subcategory && subcategory !== "All" ? subcategory : null;
  if (!cat && !sub) return stats || {};

  const sourceSubs = stats?.subcategorySums || {};
  const categorySums = {};
  const subcategorySums = {};

  if (cat && sub) {
    const amount = Number(sourceSubs[cat]?.[sub]) || 0;
    if (amount) {
      categorySums[cat] = amount;
      subcategorySums[cat] = { [sub]: amount };
    }
  } else if (cat) {
    const total = Number(stats?.categorySums?.[cat]) || 0;
    if (total) categorySums[cat] = total;
    if (sourceSubs[cat]) subcategorySums[cat] = { ...sourceSubs[cat] };
  } else if (sub) {
    for (const [name, subs] of Object.entries(sourceSubs)) {
      const amount = Number(subs?.[sub]) || 0;
      if (!amount) continue;
      categorySums[name] = amount;
      subcategorySums[name] = { [sub]: amount };
    }
  }

  const monthlyCategoryTotals = (stats?.monthlyCategoryTotals || []).filter((row) => {
    if (cat && row.category !== cat) return false;
    if (sub && row.subcategory !== sub) return false;
    return true;
  });

  return {
    categorySums,
    subcategorySums,
    monthlyCategoryTotals,
  };
}
