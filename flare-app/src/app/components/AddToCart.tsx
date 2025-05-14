"use client";
//nu gebruiken we enkel deze component client side, zo wordt het geoptimaliseerd
const AddToCart = () => {
  return (
    <button
      onClick={() => {
        console.log("clicked");
      }}
    >
      Add to cart{" "}
    </button>
  );
};

export default AddToCart;
