# Exercise Tracker REST API

#### A microservice project, part of Free Code Camp's curriculum


 * Create a New User  
  `POST /api/exercise/new-user`

 * Add exercises  
   `POST /api/exercise/add`
 * Get users's exercise log  
   `GET /api/exercise/log?{userId}[&from][&to][&limit]`
     * { } = required, [ ] = optional
     * from, to = dates (yyyy-mm-dd); limit = number
     
     
code is on github [https://github.com/christianpujol/fcc-exo-tracker](https://github.com/christianpujol/fcc-exo-tracker)  
live on glitch [https://track-me.glitch.me/](https://track-me.glitch.me/)