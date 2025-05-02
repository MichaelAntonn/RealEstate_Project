import { Component, Input, AfterViewInit } from '@angular/core';
declare var PANOLENS: any;
declare var THREE: any;

@Component({
  selector: 'app-panorama-viewer',
  template: `<div id="panorama-container" style="height: 500px;"></div>`,
})
export class PanoramaViewerComponent implements AfterViewInit {
  @Input() imageUrl: string = '';

  ngAfterViewInit(): void {
    const panorama = new PANOLENS.ImagePanorama(this.imageUrl);
    const viewer = new PANOLENS.Viewer({ container: document.getElementById('panorama-container') });
    viewer.add(panorama);
  }
}
