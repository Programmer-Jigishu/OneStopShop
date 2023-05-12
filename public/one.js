const fs = require('fs');
const one = {
    name : "Jigishu",
    standard:4,
    College:"IIT Dh"
}

console.log(JSON.stringify(one));

// fs.writeFile("./items/"+`${one.name}.json`,JSON.stringify(one),(error)=>{
//     if(error){
//     console.log("failed!!");
//     return;}
//     else{
//         console.log("file written successfully");
//     }
// })
const items = fs.readdirSync("./items");
// console.log(items[0])

items.forEach(element => {
    try {
      console.log(`Reading file: ./items/${element}`);
      const data = fs.readFileSync(`./items/${element}`);
      const parsedData = JSON.parse(data);
      console.log(parsedData);
    } catch (err) {
      console.error(`Error reading file: ./items/${element}`);
      console.error(err);
    }
  });
  
