const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export async function request(
  path,
  { method = "GET", body, token, isForm = false } = {}
) {
  const headers = {};

  if (token && !isForm) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!isForm) {
    headers["Content-Type"] = "application/json";
  }

  const url = `${BASE_URL}${path}`;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
    });

    console.log("Request:", url, "Status:", res.status);

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    try {
      return await res.json();
    } catch (err) {
      console.error("Failed to parse JSON response:", err);
      return null;
    }
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
}

// -------------------- Auth --------------------
export function signupRequest(payload) {
  return request("/auth/signup", { method: "POST", body: payload });
}

export function loginRequest(email, password) {
  return request("/auth/signin", { method: "POST", body: { email, password } });
}

// -------------------- Expenses --------------------
export function getExpenses(token) {
  return request("/expenses", { method: "GET", token });
}

export function createExpense(payload, token) {
  return request("/expenses", { method: "POST", body: payload, token });
}

export function updateExpense(id, payload, token) {
  return request(`/expenses/${id}`, { method: "PATCH", body: payload, token });
}

export function deleteExpense(id, token) {
  return request(`/expenses/${id}`, { method: "DELETE", token });
}

// -------------------- Payments --------------------
export function getUpcomingPayments(token) {
  return request("/payments/upcoming", { method: "GET", token });
}

export function getOverduePayments(token) {
  return request("/payments/overdue", { method: "GET", token });
}

export function markPaymentAsPaid(paymentId, token, amount = null) {
  return request(`/payments/${paymentId}/pay`, {
    method: "PATCH",
    body: amount ? { amount } : {},
    token,
  });
}

// -------------------- History --------------------
export function getPaidPayments(token) {
  return request("/history", { method: "GET", token });
}

// -------------------- Services --------------------
export function getServices(token) {
  return request("/services", { method: "GET", token });
}

export function createService(payload, token) {
  return request("/services", { method: "POST", body: payload, token });
}

export function updateService(id, payload, token) {
  return request(`/services/${id}`, { method: "PATCH", body: payload, token });
}

export function deleteService(id, token) {
  return request(`/services/${id}`, { method: "DELETE", token });
}

// -------------------- Household --------------------
export function getHousehold(token) {
  return request("/household", { method: "GET", token });
}

export function createMember(payload, token) {
  return request("/household/members", {
    method: "POST",
    body: payload,
    token,
  });
}

export function updateMember(memberId, payload, token) {
  return request(`/household/members/${memberId}`, {
    method: "PUT",
    body: payload,
    token,
  });
}

export function deleteMember(memberId, token) {
  return request(`/household/members/${memberId}`, {
    method: "DELETE",
    token,
  });
}

// -------------------- Dashboard --------------------
export async function getDashboardData(token) {
  if (!token) throw new Error("Authentication required");

  try {
    const [upcomingPayments, overduePayments] = await Promise.all([
      getUpcomingPayments(token),
      getOverduePayments(token),
    ]);

    return { upcomingPayments, overduePayments };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    throw error;
  }
}
