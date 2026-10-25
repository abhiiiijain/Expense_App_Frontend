import { apiClient } from "./client";

function txPayload(transaction) {
  const { title, amount, category, subcategory, icon, date, accountId, settlesAccountId } =
    transaction;
  return {
    title,
    amount,
    category,
    subcategory,
    icon,
    date,
    accountId,
    ...(settlesAccountId ? { settlesAccountId } : {}),
  };
}

function withQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchDashboardStamp() {
  const { data } = await apiClient.get("transactions/sync");
  return data.stamp;
}

export async function fetchMonthTransactions({ monthKey, accountId } = {}) {
  const { data } = await apiClient.get(
    `transactions${withQuery({
      monthKey,
      accountId: accountId && accountId !== "all" ? accountId : undefined,
    })}`
  );
  return data;
}

export async function searchTransactions(query) {
  const { data } = await apiClient.get(`transactions${withQuery({ q: query })}`);
  return {
    expenses: data.expenses || [],
    incomes: data.incomes || [],
    transfers: data.transfers || [],
  };
}

export async function fetchTransactionsRange({ from, to, accountId } = {}) {
  const { data } = await apiClient.get(
    `transactions${withQuery({
      from,
      to,
      accountId: accountId && accountId !== "all" ? accountId : undefined,
    })}`
  );
  return {
    expenses: data.expenses || [],
    incomes: data.incomes || [],
    transfers: data.transfers || [],
  };
}

export async function fetchSpendingStats({ accountId, category, subcategory } = {}) {
  const { data } = await apiClient.get(
    `transactions/stats${withQuery({
      accountId: accountId && accountId !== "all" ? accountId : undefined,
      category: category && category !== "All" ? category : undefined,
      subcategory: subcategory && subcategory !== "All" ? subcategory : undefined,
    })}`
  );
  return data;
}

export async function createTransaction(transaction) {
  const endpoint = transaction.type === "income" ? "add-income" : "add-expense";
  const { data } = await apiClient.post(endpoint, txPayload(transaction));
  return data;
}

export async function updateTransaction(type, id, transaction) {
  const endpoint = type === "income" ? `update-income/${id}` : `update-expense/${id}`;
  const { data } = await apiClient.put(endpoint, txPayload(transaction));
  return data;
}

export async function deleteTransaction(type, id) {
  const endpoint = type === "income" ? `delete-income/${id}` : `delete-expense/${id}`;
  await apiClient.delete(endpoint);
}
