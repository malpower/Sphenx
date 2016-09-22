let httpinvoke=require("httpinvoke");
let htmlAnalyst=require("./htmlAnalyst");


function Start(url,callback)
{
    let scanned=new Object;
    let taskList=new Array;
    taskList.push(url);
    function DownloadNext()
    {
        if (taskList.length===0)
        {
            console.log("All Task Finished");
            return 0;
        }
        let url=taskList.shift();
        if (scanned[url]===true)
        {
            return process.nextTick(DownloadNext);
        }

        httpinvoke(url,"GET",function(err,body,statusCode,headers)
        {
            if (err)
            {
                return process.nextTick(DownloadNext);
            }
            scanned[url]=true;
            htmlAnalyst.analysis(body,function(pages,images)
            {
                console.log(images);
                for (let i=0;i<pages.length;i++)
                {
                    taskList.push(pages[i]);
                }
                process.nextTick(callback,images);
                process.nextTick(DownloadNext);
            });
        });
    }
    DownloadNext();
}

module.exports={init: Start};
