import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  breadcrumbs: { label: string; url: string }[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
      this.ensureOpenDataLACBreadcrumb();
    });
  }

  private createBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: { label: string; url: string }[] = []
  ): { label: string; url: string }[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
        let breadcrumbLabel = child.snapshot.data['breadcrumb'] || routeURL;

        // Handle special case: "Dataset Detail"
        if (breadcrumbLabel === 'Dataset Detail') {
          breadcrumbLabel = 'Dataset';
          const catalogExists = breadcrumbs.some(breadcrumb => breadcrumb.label === 'Dataset Catalog');
          if (!catalogExists) {
            breadcrumbs.push({ label: 'Dataset Catalog', url: '/browse' });
          }
        }

        breadcrumbs.push({ label: breadcrumbLabel, url });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  private ensureOpenDataLACBreadcrumb(): void {
    const openDataLACExists = this.breadcrumbs.some(breadcrumb => breadcrumb.label === 'Open Data LAC');
    if (!openDataLACExists) {
      this.breadcrumbs.splice(0, 0, {
        label: 'Open Data LAC',
        url: '/'
      });
    }
  }
}
