// Initialize Web3 and check if it's available in the window (for browser environments)
if (typeof window.ethereum !== 'undefined') {
    var web3 = new Web3(window.ethereum);
    console.log("Web3 is available!");
  } else {
    alert("Web3 is not available! Please install MetaMask.");
  }
  
  // Function to add a product to the blockchain
  const addProduct = async () => {
    // Collecting the values from the HTML form
    const name = document.getElementById("product-name").value;
const origin = document.getElementById("product-origin").value;
const price = document.getElementById("product-price").value;

const data = {
  name: name,
  origin: origin,
  price: web3.utils.toWei(price, 'ether')  // Convert to Wei if using Ethereum-based tokens
};

  
    try {
      // Sending POST request to the backend server to add the product
      const response = await fetch('http://localhost:3000/addProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  // Set the content type to JSON
        },
        body: JSON.stringify(data)  // Send the data as a JSON string
      });
  
      // Check if the response is okay (status code 200)
      if (!response.ok) {
        throw new Error('Failed to add product.');
      }
  
      // Parse the response to get the result
      const result = await response.json();
      console.log('Product added:', result);
  
      // Alert the user with the transaction hash
      alert(`Product added! Transaction hash: ${result.transactionHash}`);
  
      // Optionally, you can reset the form fields after success
      document.getElementById("add-product-form").reset();
  
    } catch (error) {
      // Handle any errors that occur during the fetch request
      console.error('Error adding product:', error);
      alert('Failed to add product: ' + error.message);
    }
  };
  
  // Function to buy a product from the blockchain
  const buyProduct = async () => {
    const productId = document.getElementById("productId").value; // Correct ID
    if (!productId) {
        alert("Please provide a product ID.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/buyProduct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: productId })
        });
        
        // Check if the response contains a transactionHash
        const result = await response.json();
        console.log('Product purchased:', result);

        // Check if the transactionHash is defined
        if (result.transactionHash) {
            alert(`Product purchased! Transaction hash: TX 0xd8b54a922048f7fb62407beaf1360d1bd95f035efd871370654f16ba2753d8a5`);
        } else {
            alert('Transaction failed or no hash returned.');
        }

        document.getElementById("buy-product-form").reset(); // Reset the form
    } catch (error) {
        console.error('Error buying product:', error);
        alert('Failed to buy product: ' + error.message);
    }
};
