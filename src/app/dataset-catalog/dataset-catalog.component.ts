import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';  // Asegúrate de que la ruta al servicio sea correcta
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dataset-catalog',
  standalone: true,
  imports: [CommonModule],  // Importa CommonModule para poder usar directivas como ngIf y ngFor
  templateUrl: './dataset-catalog.component.html',
  styleUrls: ['./dataset-catalog.component.scss']  // Cambié styleUrl a styleUrls para estar conforme con la convención
})
export class DatasetCatalogComponent implements OnInit {
  datasets: any[] = [];  // Array para almacenar los metadatos

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    // Obtener metadata de los datasets desde el servicio
    this.dataService.getMetadata().subscribe(data => {
      console.log("Datos cargados:", data);
      console.log(data); // Verifica si los datos están bien formateados
      this.datasets = data;  // Aquí asumimos que `data` es un array de datasets
    });
  }

  // Función para navegar al detalle del dataset
  viewDataset(category: string, filename: string): void {
    console.log('Datos de category y filename antes de navegar:');
    console.log('Category:', category);
    console.log('Filename:', filename);

    if (category && filename) {
      console.log(`Navegando a la URL: /dataset/${category}/${filename}`);

      this.router.navigate([`/dataset/${category}/${filename}`]);
    } else {
      console.error('Category o Filename no definido');
    }
  }
}
