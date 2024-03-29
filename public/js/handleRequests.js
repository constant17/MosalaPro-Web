async function getRequests(type, lim){

    const completed = document.getElementById("completed-bookings");
    const inprogress = document.getElementById("inprogress-bookings");
    const active = document.getElementById("active-bookings");
    const cancelled = document.getElementById("cancelled-bookings");
    const missing = document.getElementById("missing-bookings");
    const booked = document.getElementById("booked-bookings");
    const all = document.getElementById("all-bookings");
    if(type=="all"){
      completed.classList.remove("active");
      cancelled.classList.remove("active");
      active.classList.remove("active");
      missing.classList.remove("active");
      all.classList.add("active");
      inprogress.classList.remove("active");
      booked.classList.remove("active");
    }
    else if(type=="active"){
      completed.classList.remove("active");
      cancelled.classList.remove("active");
      active.classList.add("active");
      missing.classList.remove("active");
      all.classList.remove("active");
      inprogress.classList.remove("active");
      booked.classList.remove("active");
    }
    else if(type=="in-progress"){
      inprogress.classList.add("active");
      completed.classList.remove("active");
      cancelled.classList.remove("active");
      active.classList.remove("active");
      missing.classList.remove("active");
      all.classList.remove("active");
      booked.classList.remove("active");
    }
    else if(type=="cancelled"){
      completed.classList.remove("active");
      cancelled.classList.add("active");
      active.classList.remove("active");
      missing.classList.remove("active");
      all.classList.remove("active");
      inprogress.classList.remove("active");
      booked.classList.remove("active");
    }
    else if(type=="completed"){
      completed.classList.add("active");
      cancelled.classList.remove("active");
      active.classList.remove("active");
      missing.classList.remove("active");
      all.classList.remove("active");
      inprogress.classList.remove("active");
      booked.classList.remove("active");
    }
    else if(type=="missing-details"){
      completed.classList.remove("active");
      cancelled.classList.remove("active");
      active.classList.remove("active");
      missing.classList.add("active");
      all.classList.remove("active");
      inprogress.classList.remove("active");
      booked.classList.remove("active");
    }
    else if(type=="booked"){
      completed.classList.remove("active");
      cancelled.classList.remove("active");
      active.classList.remove("active");
      booked.classList.add("active");
      all.classList.remove("active");
      missing.classList.remove("active");
      inprogress.classList.remove("active");
    }
  
    const url = new URL(window.location.href);
    url.searchParams.set('type', type);
    window.history.replaceState(null, null, url); 
    const res = await fetch(`/getrequests?type=${type}&lim=${lim}`);
    const requests = await res.json();
  
    const requestsBox = document.getElementById("requests-container");
    requestsBox.innerHTML = "";
    let content = "";
    if(requests.length == 0 || res.length == 0)
          requestsBox.innerHTML = `<div class=" col d-flex justify-content-center align-items-center"><h6 class="text-light text-muted">No request found!</h6></div>`;
    else{
      let loadMore = "";
      const classes = ["bg-soft-danger", "bg-soft-base", "bg-soft-warning", "bg-soft-success", "bg-soft-info"];
      for(const request of requests) {
         let date = request.lastUpdate.split("-");
         let button = "";
         if( request.status == 'active')
            button = `<a class="btn-job btn-primary-job-inv" href="/manage-request?rq=${ request._id }">Edit request</a>`;
          else if(request.status == 'cancelled')
            button = `<a class="btn-job btn-primary-job-inv-blue" href="/manage-request?rq=${ request._id }">Resubmit request</a>`;
          else
            button = `<a class="btn-job btn-primary-job-inv-blue" href="/manage-request?rq=${ request._id }">View details</a>`;
          const reqt =  `
              <div class="col-lg-4 col-md-6 col-12 mt-1 pt-2">
                <div class="card border-0 bg-light-job rounded-job shadow-job">
                    <div class="card-body p-4">
                    <span class="btn btn-sm ${classes[Math.floor(Math.random() * 5)]} cat-job float-md-right mb-3 mb-sm-0">${ request.requestCategory }</span>
                    <h5>${ request.requestTitle }</h5>
                    <div class="mt-3">
                        <span class="d-block job-details"><b class="fa fa-money mr-2" aria-hidden="true"></b>  Budget: ${ request.budget }</span>
                        <span class="d-block job-details"><b class="fa fa-calendar mr-2" aria-hidden="true"></b> Deadline: ${ request.deadline }</span>
                    </div>
                    
                    <div class="mt-3 border-bottom pb-4 d-flex ">` + button +
                        
                    `</div>
                        <div class=""><span class="float-md-right text-small mt-1">Submitted on ${date[1]}/${date[2].substr(0,2)}/${date[0]}</span></div>
                    </div>
                
                </div>
              </div>
              `;
          content = content + reqt;
        }
        if(requests.length <= 6)
          lim = requests.length;
        
        if(lim != requests.length){
        loadMore = `<div class="text-center text-md-end d-md-block">
          <a href="#" class="text-primary">Load more requests <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right fea icon-sm"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a>
          </div>`;
        }
        requestsBox.innerHTML = content+loadMore;
      } 
      
  }
