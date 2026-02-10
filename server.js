const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const EMAIL = process.env.EMAIL || "your_email@chitkara.edu.in";

function fibonacci(n){
  if(n<=0) return [];
  if(n===1) return [0];
  let arr=[0,1];
  for(let i=2;i<n;i++){
    arr.push(arr[i-1]+arr[i-2]);
  }
  return arr;
}

function isPrime(num){
  if(num<2) return false;
  for(let i=2;i<=Math.sqrt(num);i++){
    if(num%i===0) return false;
  }
  return true;
}

function gcd(a,b){ return b===0 ? a : gcd(b,a%b); }

function lcm(a,b){ return (a*b)/gcd(a,b); }

app.post("/bfhl", async (req,res)=>{
  try{
    const body=req.body;
    const keys=Object.keys(body);

    if(keys.length!==1){
      return res.status(400).json({is_success:false,error:"Exactly one key required"});
    }

    const key=keys[0];
    let data;

    switch(key){

      case "fibonacci":
        if(typeof body[key] !== "number") throw "Invalid type";
        data=fibonacci(body[key]);
        break;

      case "prime":
        if(!Array.isArray(body[key])) throw "Invalid type";
        data=body[key].filter(isPrime);
        break;

      case "hcf":
        if(!Array.isArray(body[key])) throw "Invalid type";
        data=body[key].reduce(gcd);
        break;

      case "lcm":
        if(!Array.isArray(body[key])) throw "Invalid type";
        data=body[key].reduce(lcm);
        break;

      case "AI":
        if(typeof body[key] !== "string") throw "Invalid type";

        const ai = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
          {
            contents: [
              {
                parts: [{ text: `Answer "${body[key]}" with ONLY a number (like just "7" or "42"). No other text.` }]
              }
            ]
          }
        );

        let text = ai.data.candidates[0].content.parts[0].text.toLowerCase().trim();
        let match = text.match(/(\d+)/);
        data = match ? match[1] : text.replace(/[^a-zA-Z0-9]/g,"");
        break;

      default:
        return res.status(400).json({is_success:false,error:"Invalid key"});
    }

    res.json({
      is_success:true,
      official_email:EMAIL,
      data:data
    });

  }catch(err){
    res.status(422).json({is_success:false,error:"Invalid input"});
  }
});

app.get("/health",(req,res)=>{
  res.json({is_success:true,official_email:EMAIL});
});

const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>console.log("Running on "+PORT));
