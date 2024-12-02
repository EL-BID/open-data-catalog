import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLinkedin, faFacebook, faXTwitter, faInstagram, faYoutube, faFlickr} from '@fortawesome/free-brands-svg-icons';
import { faPodcast } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  faLinkedin = faLinkedin;
  faFacebook = faFacebook;
  faXTwitter = faXTwitter;
  faInstagram = faInstagram;
  faYoutube= faYoutube;
  faFlickr = faFlickr;
  faPodcast = faPodcast;
}
