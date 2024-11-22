import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, RouterLinkActive, RouterOutlet, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, RouterLinkActive, RouterOutlet],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  breadcrumbs: { label: string; url: string }[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
        this.insertDatasetCatalogBreadcrumb();
      });
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: { label: string; url: string }[] = []): any[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;

        let breadcrumbLabel = child.snapshot.data['breadcrumb'] || routeURL;

        // Personalización dinámica: Reemplazar "Dataset Detail" por "Dataset"
        if (breadcrumbLabel === 'Dataset Detail') {
          breadcrumbLabel = 'Dataset';

          // Agregar "Dataset Catalog" antes de "Dataset" si no existe en los breadcrumbs
          const catalogExists = breadcrumbs.some(b => b.label === 'Dataset Catalog');
          if (!catalogExists) {
            breadcrumbs.push({
              label: 'Dataset Catalog',
              url: '/browse',
            });
          }
        }

        breadcrumbs.push({
          label: breadcrumbLabel,
          url,
        });
      }
      return this.createBreadcrumbs(child, url, breadcrumbs);
    }
    return breadcrumbs;
  }

  private insertDatasetCatalogBreadcrumb(): void {
    const isDatasetDetailRoute = this.breadcrumbs.some(breadcrumb =>
      breadcrumb.label === 'Dataset Detail'
    );

    if (isDatasetDetailRoute) {
      const catalogBreadcrumb = this.breadcrumbs.find(breadcrumb => breadcrumb.label === 'Dataset Catalog');
      if (!catalogBreadcrumb) {
        const catalogUrl = '/browse';
        this.breadcrumbs.splice(
          this.breadcrumbs.length - 1, // Insert before "Dataset Detail"
          0,
          { label: 'Dataset Catalog', url: catalogUrl }
        );
      }
    }
  }
}
