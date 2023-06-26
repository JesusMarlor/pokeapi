import express, { Request, Response } from 'express';
import axios from 'axios';
import PDFDocument from 'pdfkit';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;
app.use(bodyParser.json());

app.get('/pokemon-list', async (req: Request, response: Response) => {
    const { limit, page, search } = req.query;

    try {
        let apiUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${(Number(page) - 1) * Number(limit)}`;

        if (search) {
            const searchResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
            const pokemonList = searchResponse.data.results;
            const resultsFilter = pokemonList.filter((pokemon: any) => {
                return pokemon.name.includes(search.toString().toLowerCase());
            });

            resultsFilter.sort(
    (x: any, y: any) => x.name.localeCompare(y.name)
            );

            const start = (Number(page) - 1) * Number(limit);
            const end = start + Number(limit);
            const resultsPage = resultsFilter.slice(start, end);
            const res = await axios.all(
                resultsPage.map((pokemon: any) => {
                    return axios.get(pokemon.url);
                })
            );
            const results = res.map((res: any) => res.data);
            response.json(results);
        } else {
            const res = await axios.get(apiUrl);
            const results = res.data.results.sort((a: any, b: any) => a.name.localeCompare(b.name));
            response.json(results);
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Ocurrió un Error inesperado' });
    }
});


app.post('/pokemon-pdf', async (request: Request, response: Response) => {
    const { name } = request.body;

    try {
        const responsePokemon = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const pokemonInfo = responsePokemon.data;
        const pokePFD = new PDFDocument();
        pokePFD.fontSize(18).text('Información del Pokémon', { align: 'center' });
        pokePFD.fontSize(14).text(`Nombre: ${pokemonInfo.name}`);
        pokePFD.fontSize(14).text(`ID: ${pokemonInfo.id}`);
        pokePFD.fontSize(14).text(`Altura: ${pokemonInfo.height}`);
        pokePFD.fontSize(14).text(`Peso: ${pokemonInfo.weight}`);
        pokePFD.fontSize(14).text('* Habilidades:');
        pokemonInfo.abilities.forEach((ability: any) => {
            pokePFD.fontSize(12).text('  - '+ability.ability.name);
        });
        response.setHeader('Content-Disposition', 'attachment; filename="pokemon_info.pdf"');
        response.setHeader('Content-Type', 'application/pdf');
        pokePFD.pipe(response);
        pokePFD.end();
    } catch (error) {
        console.error(error);
        response.status(404).send('Pokémon no encontrado');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando puerto ${PORT}`);
});
