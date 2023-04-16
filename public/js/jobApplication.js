function applyForJob(){

    const jobId = document.getElementById("jobId").value;
    const creatorUsername = document.getElementById("userName").value;
    const mess = document.getElementById("mess");
    mess.innerHTML="";

    requestData = {
        username: creatorUsername,
        jobId: jobId,
    }
    
    _postData('/apply-for-sr', requestData )
      .then(async json => {
        if(json.status == 200){
            mess.classList.remove('error_message');
            mess.classList.add('success_message');
            mess.innerHTML = "Your application has been sent successfully!";
            await new Promise(r => setTimeout(r, 700));
            $('#jobDetailModal1 .close').click();
        }
        else{
            mess.innerHTML = "Error json status: "+json.status;
        }
        
      }).catch(err => {
        console.log(err) // Handle errors
        mess.innerHTML = "Error: "+err;
      });

}

async function _postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(data)
    });
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    }else{ return response;}
}