// // src/app/services/echo.service.ts
// import { Injectable } from '@angular/core';
// import Echo from 'laravel-echo';
// import Pusher from 'pusher-js';
// import { environment } from '../../environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class EchoService {
//   echo: Echo<any>;

//   constructor() {
//     this.echo = new Echo({
//       broadcaster: 'pusher',
//       key: environment.pusher.key,
//       cluster: environment.pusher.cluster,
//       forceTLS: true,
//       encrypted: true,
//       auth: {
//         headers: {
//           'X-XSRF-TOKEN': this.getCookie('XSRF-TOKEN'),
//         }
//       }
//     });
//   }

//   private getCookie(name: string): string {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     console.log("####################",parts);

//     if (parts.length === 2) {
//       return parts.pop()!.split(';').shift()!;
//     }
//     return '';
//   }

//   listenToChannel(channel: string, event: string, callback: (data: any) => void): void {
//     this.echo.channel(channel).listen(event, callback);
//   }
// }
