import type { Order } from "../types/order";

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

  const today = new Date();
  const todayRevenue = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);

    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear === today.getFullYear &&
      order.paymentStatus === "SUDAH_DIBAYAR"
    );
  }).reduce((total, order) => {
    return total + Number(order.total);
  }, 0)

  return {
    activeOrders,
    processing,
    ready,
    unpaid,
    todayRevenue,
  };
};