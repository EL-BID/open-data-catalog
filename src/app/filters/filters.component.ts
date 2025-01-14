import { Component, OnInit, AfterViewInit, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent implements OnInit, AfterViewInit {
  @Input() filters: { [key: string]: string[] } = {};
  @Output() filtersChanged = new EventEmitter<any>();

  topics: string[] = [];
  regions: { [key: string]: string[] } = {};
  years: string[] = [];
  languages: string[] = [];
  idbKnowledges: string[] = [];

  selectedFilters: { [key: string]: boolean } = {};
  expandedRegions: { [key: string]: boolean } = {};
  visibleTopics: string[] = [];
  visibleYears: string[] = [];

  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  languageMapping: { [key: string]: string } = {
    "English": "en",
    "Spanish": "es",
    "Portuguese": "pt",
    "French": "fr"
  };

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadFilters();
  }

  ngAfterViewInit(): void {
    this.updateVisibleFilters();
  }

  ngOnChanges(): void {
    this.syncCheckboxes();
  }

  syncCheckboxes(): void {
    this.selectedFilters = {};
    Object.keys(this.filters).forEach(category => {
      this.filters[category].forEach(value => {
        this.selectedFilters[value] = true;
      });
    });
    this.cdr.detectChanges();
  }

  onFilterChange(): void {
    this.filtersChanged.emit(this.filters);
  }

  removeFilter(category: string, value: string): void {
    if (this.filters[category]) {
      this.filters[category] = this.filters[category].filter((val: string) => val !== value);
      this.onFilterChange();
    }
  }

  loadFilters(): void {
    this.dataService.getFilters().subscribe(data => {
      this.topics = data.topics.sort();
      this.regions = data.regions;
      this.years = data.years;
      this.languages = data.languages;
      this.idbKnowledges = data.idbKnowledges;

      this.initializeSelectedFilters();
      this.updateVisibleFilters();
    });
  }

  initializeSelectedFilters(): void {
    const urlFilters = this.filters || {};
    const urlTopics = this.getQueryParam('topics');
    const urlCountries = this.getQueryParam('countries');
    const urlYears = this.getQueryParam('years');
    const urlLanguages = this.getQueryParam('languages');
    const urlIdbKnowledges = this.getQueryParam('idbKnowledges');

    this.topics.forEach(topic => {
      this.selectedFilters[topic] = urlTopics.includes(topic);
    });

    Object.keys(this.regions).forEach(region => {
      this.regions[region].forEach(country => {
        this.selectedFilters[country] = urlCountries.includes(country);
      });
    });

    this.years.forEach(year => {
      this.selectedFilters[year] = urlYears.includes(year);
    });

    this.languages.forEach(language => {
      this.selectedFilters[language] = urlLanguages.includes(language);
    });

    this.idbKnowledges.forEach(idbKnowledge => {
      this.selectedFilters[idbKnowledge] = urlIdbKnowledges.includes(idbKnowledge);
    });
  }

  getQueryParam(param: string): string[] {
    const urlParams = new URLSearchParams(window.location.search);
    const paramValue = urlParams.get(param);
    return paramValue ? paramValue.split(',').map(p => decodeURIComponent(p.trim())) : [];
  }

  updateVisibleFilters() {
    const topicsPerPage = 5;
    const yearsPerPage = 5;
    this.visibleTopics = this.topics.slice(0, topicsPerPage);
    this.visibleYears = this.years.slice(0, yearsPerPage);
  }

  showAllTopics() {
    this.visibleTopics = [...this.topics];
    this.cdr.detectChanges();
  }

  showAllYears() {
    this.visibleYears = [...this.years];
    this.cdr.detectChanges();
  }

  toggleRegion(regionKey: string): void {
    this.expandedRegions[regionKey] = !this.expandedRegions[regionKey];
    this.cdr.detectChanges();
  }

  emitFilters() {
    const selectedTopics = this.topics.filter(topic => this.selectedFilters[topic]);
    const selectedCountries: string[] = Object.keys(this.regions).reduce((selected: string[], region: string) => {
      const selectedInRegion = this.regions[region].filter(country => this.selectedFilters[country]);
      return [...selected, ...selectedInRegion];
    }, []);
    const selectedYears = this.years.filter(year => this.selectedFilters[year]);
    const selectedLanguages = this.languages
      .filter(language => this.selectedFilters[language])
      .map(language => this.languageMapping[language]);
    const selectedIdbKnowledges = this.idbKnowledges.filter(idbKnowledge => this.selectedFilters[idbKnowledge]);

    this.filtersChanged.emit({
      topics: selectedTopics,
      countries: selectedCountries,
      years: selectedYears,
      languages: selectedLanguages,
      idbKnowledges: selectedIdbKnowledges,
    });
  }

  onCheckboxKeydown(value: string, type: string) {
    switch (type) {
      case 'topic':
        this.selectedFilters[value] = !this.selectedFilters[value];
        break;
      case 'country':
        this.selectedFilters[value] = !this.selectedFilters[value];
        break;
      case 'year':
        this.selectedFilters[value] = !this.selectedFilters[value];
        break;
      case 'language':
        this.selectedFilters[value] = !this.selectedFilters[value];
        break;
      case 'idbKnowledge':
        this.selectedFilters[value] = !this.selectedFilters[value];
        break;
    }
    this.emitFilters();
  }
}
