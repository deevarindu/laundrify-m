type Order = {
  orderStatus: string;
  paymentStatus: string;
  payment: {
    amount: string;
    paidAt: string;
  } | null;
};

export const getDashboardStats = (orders: Order[]) => {
  const activeOrders = orders.filter(
    (order) =>
      order.orderStatus !== "SELESAI" &&
      order.orderStatus !== "DIBATALKAN"
  ).length;

  const processing = orders.filter((order) =>
    [
      "DICUCI",
      "DIKERINGKAN",
      "DISETRIKA",
    ].includes(order.orderStatus)
  ).length;

  const ready = orders.filter(
    (order) => order.orderStatus === "SIAP_DIAMBIL"
  ).length;

  const unpaid = orders.filter(
    (order) => order.paymentStatus === "BELUM_DIBAYAR"
  ).length;

  return {
    activeOrders,
    processing,
    ready,
    unpaid,
  };
};