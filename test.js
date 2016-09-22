let wget=require("wget");


let url="https://www.google.nsssl/logos/doodles/2016/first-day-of-fall-2016-northern-hemisphere-5139283208830976-scta.png";

let task=wget.download(url,"aaa"+url.match(/\.[a-zA-Z0-9]{0,}$/)[0],{});
task.on("end",function(output)
{
    console.log(output);
});
task.on("error",function(e)
{
    console.log(e);
});
