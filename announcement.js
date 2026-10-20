/* EDIT THIS FILE to announce a new event, song release, or show on the homepage.
   Set link to the ticket, music, or show URL. Use enabled:false to hide banner. */
window.nextAnnouncement = {
  enabled: true,
  category: "UPCOMING EVENT",
  title: "GEN-Z DANCEHALL VS AFROBEATS",
  description: "November 14, 2026 · Debut Bar · Downtown Barrie · 19+",
  dateLabel: "NOV 14",
  presenter: "EMMMPIRE PRESENTS",
  location: "BARRIE, ONTARIO",
  buttonText: "GET TICKETS ↗",
  link: "https://luma.com/3qck0nd2"
};
(function(){
 const banner=document.getElementById('announcement-banner');
 if(!banner)return;
 if(!nextAnnouncement.enabled){banner.hidden=true;return;}
 const put=(selector,value)=>{const el=banner.querySelector(selector);if(el)el.textContent=value;};
 put('#announcement-category',nextAnnouncement.category);
 put('#announcement-title',nextAnnouncement.title);
 put('#announcement-description',nextAnnouncement.description);
 put('#announcement-date',nextAnnouncement.dateLabel);
 put('.announcement-side-top',nextAnnouncement.presenter);
 put('.announcement-side-bottom',nextAnnouncement.location);
 const link=banner.querySelector('#announcement-link');
 link.textContent=nextAnnouncement.buttonText;
 if(nextAnnouncement.link){link.href=nextAnnouncement.link;}else{link.hidden=true;}
})();
