import type { Track } from '$lib/types/music';
import { INITIAL_CURATED_TRACKS } from '$lib/db';

// Catálogo expandido de demonstração para quando a chave de API não for informada
export const DEMO_MUSIC_CATALOG: Track[] = [
	...INITIAL_CURATED_TRACKS,
	{
		id: 'kJQP7kiw5Fk',
		title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
		artist: 'Luis Fonsi',
		thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
		duration: '4:41',
		durationSec: 281,
		album: 'Vida'
	},
	{
		id: 'fLexgOxsZu0',
		title: 'Bruno Mars - That\'s What I Like',
		artist: 'Bruno Mars',
		thumbnail: 'https://i.ytimg.com/vi/fLexgOxsZu0/hqdefault.jpg',
		duration: '3:30',
		durationSec: 210,
		album: '24K Magic'
	},
	{
		id: 'OPf0YbXqDm0',
		title: 'Mark Ronson - Uptown Funk ft. Bruno Mars',
		artist: 'Mark Ronson',
		thumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg',
		duration: '4:30',
		durationSec: 270,
		album: 'Uptown Special'
	},
	{
		id: '2Vv-BfVoq4g',
		title: 'Ed Sheeran - Perfect',
		artist: 'Ed Sheeran',
		thumbnail: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg',
		duration: '4:39',
		durationSec: 279,
		album: 'Divide'
	},
	{
		id: '09R8_2nJtjg',
		title: 'Maroon 5 - Sugar',
		artist: 'Maroon 5',
		thumbnail: 'https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg',
		duration: '5:01',
		durationSec: 301,
		album: 'V'
	},
	{
		id: 'e-ORhEE9VVg',
		title: 'Taylor Swift - Blank Space',
		artist: 'Taylor Swift',
		thumbnail: 'https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg',
		duration: '4:32',
		durationSec: 272,
		album: '1989'
	},
	{
		id: 'YQHsXMglC9A',
		title: 'Adele - Hello',
		artist: 'Adele',
		thumbnail: 'https://i.ytimg.com/vi/YQHsXMglC9A/hqdefault.jpg',
		duration: '6:06',
		durationSec: 366,
		album: '25'
	},
	{
		id: 'CevxZvSJLk8',
		title: 'Katy Perry - Roar',
		artist: 'Katy Perry',
		thumbnail: 'https://i.ytimg.com/vi/CevxZvSJLk8/hqdefault.jpg',
		duration: '4:30',
		durationSec: 270,
		album: 'Prism'
	},
	{
		id: 'pRpeEdMmmQ0',
		title: 'Shakira - Waka Waka (This Time for Africa)',
		artist: 'Shakira',
		thumbnail: 'https://i.ytimg.com/vi/pRpeEdMmmQ0/hqdefault.jpg',
		duration: '3:30',
		durationSec: 210,
		album: 'Sale el Sol'
	},
	{
		id: 'kOkQ4T5WO9E',
		title: 'Calvin Harris - This Is What You Came For ft. Rihanna',
		artist: 'Calvin Harris',
		thumbnail: 'https://i.ytimg.com/vi/kOkQ4T5WO9E/hqdefault.jpg',
		duration: '3:59',
		durationSec: 239,
		album: 'Single'
	},
	{
		id: 'uelHwf8o7_U',
		title: 'Eminem - Love The Way You Lie ft. Rihanna',
		artist: 'Eminem',
		thumbnail: 'https://i.ytimg.com/vi/uelHwf8o7_U/hqdefault.jpg',
		duration: '4:26',
		durationSec: 266,
		album: 'Recovery'
	},
	{
		id: 'ALZHF5UqnU4',
		title: 'Marshmello - Alone',
		artist: 'Marshmello',
		thumbnail: 'https://i.ytimg.com/vi/ALZHF5UqnU4/hqdefault.jpg',
		duration: '3:19',
		durationSec: 199,
		album: 'Monstercat'
	},
	{
		id: 'RgKAFK5djSk',
		title: 'Wiz Khalifa - See You Again ft. Charlie Puth',
		artist: 'Wiz Khalifa',
		thumbnail: 'https://i.ytimg.com/vi/RgKAFK5djSk/hqdefault.jpg',
		duration: '3:57',
		durationSec: 237,
		album: 'Furious 7'
	},
	{
		id: 'RBumgq5yVrA',
		title: 'Passenger - Let Her Go',
		artist: 'Passenger',
		thumbnail: 'https://i.ytimg.com/vi/RBumgq5yVrA/hqdefault.jpg',
		duration: '4:14',
		durationSec: 254,
		album: 'All the Little Lights'
	}
];

// Decodificador de entidades HTML comuns em títulos do YouTube
export function decodeHtmlEntities(str: string): string {
	const txt = document.createElement('textarea');
	txt.innerHTML = str;
	return txt.value;
}

// Conversor de duração ISO 8601 do YouTube (ex: PT3M45S -> "3:45" e 225s)
export function parseYouTubeDuration(isoDuration: string): { formatted: string; seconds: number } {
	if (!isoDuration || isoDuration === 'P0D') {
		return { formatted: '0:00', seconds: 0 };
	}

	const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
	const matches = isoDuration.match(regex);

	if (!matches) {
		return { formatted: '0:00', seconds: 0 };
	}

	const hours = parseInt(matches[1] || '0', 10);
	const minutes = parseInt(matches[2] || '0', 10);
	const seconds = parseInt(matches[3] || '0', 10);

	const totalSeconds = hours * 3600 + minutes * 60 + seconds;

	if (hours > 0) {
		const padM = minutes.toString().padStart(2, '0');
		const padS = seconds.toString().padStart(2, '0');
		return { formatted: `${hours}:${padM}:${padS}`, seconds: totalSeconds };
	}

	const padS = seconds.toString().padStart(2, '0');
	return { formatted: `${minutes}:${padS}`, seconds: totalSeconds };
}

// Testa se a chave da YouTube Data API é válida
export async function testApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
	if (!apiKey || apiKey.trim().length === 0) {
		return { valid: false, message: 'Por favor, insira uma chave de API.' };
	}

	try {
		const res = await fetch(
			`https://www.googleapis.com/youtube/v3/search?part=snippet&q=music&type=video&maxResults=1&key=${apiKey.trim()}`
		);

		const data = await res.json();

		if (!res.ok) {
			const errorMsg = data.error?.message || 'Chave inválida ou limite excedido.';
			return { valid: false, message: errorMsg };
		}

		return { valid: true, message: 'Chave validada com sucesso!' };
	} catch (err: any) {
		return { valid: false, message: err?.message || 'Erro ao conectar à API do YouTube.' };
	}
}

// Chave embutida padrão (fixada permanentemente no código para uso pessoal)
export const EMBEDDED_API_KEY = 'AIzaSyAvkteQeTynDutDqtJ_PA2z9yK8Ybi1UeE';

// Busca músicas na YouTube Data API v3
export async function searchYouTube(
	query: string,
	apiKey?: string
): Promise<{ tracks: Track[]; error?: string; isDemoCatalog?: boolean }> {
	const cleanQuery = query.trim();
	if (!cleanQuery) {
		return { tracks: [] };
	}

	const effectiveApiKey = (
		apiKey ||
		EMBEDDED_API_KEY ||
		(typeof window !== 'undefined' ? localStorage.getItem('soniq_yt_api_key') || '' : '')
	).trim();

	// Se não tiver chave de API configurada, utiliza o catálogo demonstrativo inteligente
	if (!effectiveApiKey) {
		const qLower = cleanQuery.toLowerCase();
		const filtered = DEMO_MUSIC_CATALOG.filter(
			(track) =>
				track.title.toLowerCase().includes(qLower) ||
				track.artist.toLowerCase().includes(qLower) ||
				(track.album && track.album.toLowerCase().includes(qLower))
		);

		// Se a busca não encontrar nada específico no catálogo interno, retorna faixas variadas recomendadas
		const results = filtered.length > 0 ? filtered : DEMO_MUSIC_CATALOG.slice(0, 8);
		return {
			tracks: results,
			isDemoCatalog: true,
			error: 'Modo demonstração ativo: Configure sua chave gratuita da YouTube Data API nas Configurações para pesquisar qualquer música do mundo no YouTube.'
		};
	}

	try {
		// 1. Busca por vídeos de música (categoria 10 = Music)
		const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=20&q=${encodeURIComponent(cleanQuery)}&key=${effectiveApiKey}`;
		const searchRes = await fetch(searchUrl);
		const searchData = await searchRes.json();

		if (!searchRes.ok) {
			console.warn('Erro na busca do YouTube Data API:', searchData.error);
			// Fallback gracioso para o catálogo
			const qLower = cleanQuery.toLowerCase();
			const filtered = DEMO_MUSIC_CATALOG.filter(
				(track) =>
					track.title.toLowerCase().includes(qLower) || track.artist.toLowerCase().includes(qLower)
			);
			return {
				tracks: filtered.length > 0 ? filtered : DEMO_MUSIC_CATALOG.slice(0, 8),
				isDemoCatalog: true,
				error: searchData.error?.message || 'Erro ao buscar no YouTube. Verifique sua chave.'
			};
		}

		const items = searchData.items || [];
		if (items.length === 0) {
			return { tracks: [] };
		}

		// 2. Busca detalhes para obter durações
		const videoIds = items.map((item: any) => item.id?.videoId).filter(Boolean);
		let durationMap: Record<string, { formatted: string; seconds: number }> = {};

		if (videoIds.length > 0) {
			try {
				const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${effectiveApiKey}`;
				const videosRes = await fetch(videosUrl);
				const videosData = await videosRes.json();

				if (videosData.items) {
					for (const vid of videosData.items) {
						if (vid.id && vid.contentDetails?.duration) {
							durationMap[vid.id] = parseYouTubeDuration(vid.contentDetails.duration);
						}
					}
				}
			} catch (durErr) {
				console.warn('Erro ao obter durações dos vídeos:', durErr);
			}
		}

		// 3. Monta objetos Track limpos
		const tracks: Track[] = items
			.filter((item: any) => item.id?.videoId)
			.map((item: any) => {
				const videoId = item.id.videoId;
				const snippet = item.snippet;
				const durationInfo = durationMap[videoId] || { formatted: '3:30', seconds: 210 };

				const cleanTitle = decodeHtmlEntities(snippet.title);
				const channelTitle = decodeHtmlEntities(snippet.channelTitle);
				const thumbnail =
					snippet.thumbnails?.high?.url ||
					snippet.thumbnails?.medium?.url ||
					`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

				return {
					id: videoId,
					title: cleanTitle,
					artist: channelTitle,
					thumbnail,
					duration: durationInfo.formatted,
					durationSec: durationInfo.seconds,
					album: 'YouTube'
				};
			});

		return { tracks, isDemoCatalog: false };
	} catch (error: any) {
		console.error('Falha de rede ao buscar no YouTube:', error);
		return {
			tracks: DEMO_MUSIC_CATALOG.slice(0, 6),
			isDemoCatalog: true,
			error: 'Erro de conexão. Verifique sua internet ou tente novamente.'
		};
	}
}
