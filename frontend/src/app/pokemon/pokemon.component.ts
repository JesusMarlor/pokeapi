import {Component, OnInit} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.scss']
})
export class PokemonComponent implements OnInit{
  baseUrl: string = `http://localhost:3000/`;
  pokemonName: any;
  allPokemons: any[] = [];
  limit: number = 20;
  page: number = 1;
  error = '';

  constructor(
    private http: HttpClient
  ){ }

  ngOnInit() {
    this.getAllPokemons();
  }

  getAllPokemons() {
    this.http.get<any[]>(`${this.baseUrl}pokemon-list/`).subscribe({
      next:  (response:any) => {
        this.allPokemons = response;
      },
      error: (error) => {
        this.error = error.error.error || 'Ocurrió un Error';
      },
      complete: () => console.info('complete') 
  });
  }

  findPokemons() {
    let baseUrl='';
    if (typeof this.pokemonName !== 'undefined' ) {
      this.page= (this.pokemonName.length > 0) ? 1 : this.page;
    }

    if (typeof this.pokemonName  !== 'undefined') {
      baseUrl= `${this.baseUrl}pokemon-list?search=${this.pokemonName}&limit=${this.limit}&page=${this.page}`;
    } else {
      baseUrl= `${this.baseUrl}pokemon-list?limit=${this.limit}&page=${this.page}`;
    }

    this.http.get<Pokemon[]>(baseUrl).subscribe({
      next: (response: any) => {
        this.allPokemons = response;
      },
      error: (error) => {
        this.error = error.error.error || 'Ocurrió un Error';
      },
      complete: () => console.info('complete') 
  });
  }

  getDetailPokemon(name:string) {
    this.pokemonName = name;
    this.getPDFPokemon();
  }

  getPDFPokemon() {
    this.error = '';
    this.http.post(`${this.baseUrl}pokemon-pdf`, { name: this.pokemonName }, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).subscribe({
      next: (response: any) => {
        const file = new Blob([response], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
      },
      error: (error) => {
        this.error = error.error.error || 'Ocurrió un Error';
      },
      complete: () => console.info('complete') 
  });
  }
}

interface Pokemon {
  name: string;
  url: string;
}
