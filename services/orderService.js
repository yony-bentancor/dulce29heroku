const Product=require('../models/Product');
function hydrate(order){
  return {...order,items:(order.items||[]).map(i=>({...i,product:Product.find(i.productId)}))};
}
module.exports={hydrate};
