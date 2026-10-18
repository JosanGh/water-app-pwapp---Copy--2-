export const PRODUCTS = {
  electricalShop: {
    id: "electrical-shop",
    name: "Electrical Shop",
  },
  supermarket: {
    id: "supermarket",
    name: "Supermarket",
  },
};

export const isProductPage = (pageId) =>
  Object.values(PRODUCTS).some((product) => product.id === pageId);
