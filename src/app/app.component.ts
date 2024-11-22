import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, pairwise } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent implements OnInit {
  title = 'open-data-lac';

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        pairwise()
      )
      .subscribe(([prev, curr]: [NavigationEnd, NavigationEnd]) => {
        const prevUrl = new URL(prev.urlAfterRedirects, window.location.origin);
        const currUrl = new URL(curr.urlAfterRedirects, window.location.origin);
        if (prevUrl.pathname !== currUrl.pathname) {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      });
  }
}
