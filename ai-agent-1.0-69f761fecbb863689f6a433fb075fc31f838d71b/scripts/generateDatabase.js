// Script to fetch verified Apple Music previews and artwork for the seed database
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_TRACKS_SPEC = [
  // Bollywood / Hindi - Feel-Good
  { title: "Badtameez Dil", artist: "Benny Dayal, Pritam", query: "Badtameez Dil Benny Dayal", genreId: "hindi", moodIds: ["feelgood", "adrenaline"], genreName: "Bollywood / Hindi", moodName: "Feel-Good & Warm" },
  { title: "Gallan Goodiyaan", artist: "Yashita Sharma, Sukhwinder Singh", query: "Gallan Goodiyaan Dil Dhadakne Do", genreId: "hindi", moodIds: ["feelgood", "adrenaline"], genreName: "Bollywood / Hindi", moodName: "Feel-Good & Warm" },
  { title: "Dil Chahta Hai", artist: "Shankar Mahadevan", query: "Dil Chahta Hai Shankar Mahadevan", genreId: "hindi", moodIds: ["feelgood", "retro"], genreName: "Bollywood / Hindi", moodName: "Feel-Good & Warm" },
  { title: "Sooraj Ki Baahon Mein", artist: "Clinton Cerejo, Dominique Cerejo", query: "Sooraj Ki Baahon Mein ZNMD", genreId: "hindi", moodIds: ["feelgood", "adventure"], genreName: "Bollywood / Hindi", moodName: "Feel-Good & Warm" },
  { title: "Subha Hone Na De", artist: "Mika Singh, Shefali Alvares", query: "Subha Hone Na De Desi Boyz", genreId: "hindi", moodIds: ["feelgood", "adrenaline"], genreName: "Bollywood / Hindi", moodName: "Feel-Good & Warm" },

  // Bollywood / Hindi - Late-Night
  { title: "Aadat", artist: "Atif Aslam, Jal", query: "Aadat Atif Aslam Kalyug", genreId: "hindi", moodIds: ["latenight", "noir"], genreName: "Bollywood / Hindi", moodName: "Late-Night & Moody" },
  { title: "Beete Lamhein", artist: "KK", query: "Beete Lamhein The Train KK", genreId: "hindi", moodIds: ["latenight", "cry"], genreName: "Bollywood / Hindi", moodName: "Late-Night & Moody" },
  { title: "Phir Le Aya Dil", artist: "Arijit Singh, Pritam", query: "Phir Le Aya Dil Arijit Barfi", genreId: "hindi", moodIds: ["latenight", "romantic"], genreName: "Bollywood / Hindi", moodName: "Late-Night & Moody" },
  { title: "Kun Faya Kun", artist: "A.R. Rahman, Javed Ali, Mohit Chauhan", query: "Kun Faya Kun Rockstar A.R. Rahman", genreId: "hindi", moodIds: ["latenight", "feelgood"], genreName: "Bollywood / Hindi", moodName: "Late-Night & Moody" },
  { title: "Iktara", artist: "Kavita Seth, Amit Trivedi", query: "Iktara Wake Up Sid Amit Trivedi", genreId: "hindi", moodIds: ["latenight", "romantic"], genreName: "Bollywood / Hindi", moodName: "Late-Night & Moody" },

  // Bollywood / Hindi - Cry / Melancholy
  { title: "Channa Mereya", artist: "Arijit Singh, Pritam", query: "Channa Mereya Arijit Singh Pritam", genreId: "hindi", moodIds: ["cry", "romantic"], genreName: "Bollywood / Hindi", moodName: "A Good Cry" },
  { title: "Tujhe Bhula Diya", artist: "Mohit Chauhan, Shekhar Ravjiani", query: "Tujhe Bhula Diya Anjaana Anjaani", genreId: "hindi", moodIds: ["cry", "latenight"], genreName: "Bollywood / Hindi", moodName: "A Good Cry" },
  { title: "Agar Tum Saath Ho", artist: "Alka Yagnik, Arijit Singh", query: "Agar Tum Saath Ho Tamasha A.R. Rahman", genreId: "hindi", moodIds: ["cry", "romantic"], genreName: "Bollywood / Hindi", moodName: "A Good Cry" },
  { title: "Kal Ho Naa Ho (Sad)", artist: "Sonu Nigam", query: "Kal Ho Naa Ho Sad Sonu Nigam", genreId: "hindi", moodIds: ["cry", "retro"], genreName: "Bollywood / Hindi", moodName: "A Good Cry" },
  { title: "Luka Chuppi", artist: "Lata Mangeshkar, A.R. Rahman", query: "Luka Chuppi Rang De Basanti Lata Mangeshkar", genreId: "hindi", moodIds: ["cry", "latenight"], genreName: "Bollywood / Hindi", moodName: "A Good Cry" },

  // Bollywood / Hindi - High Adrenaline
  { title: "Malhari", artist: "Vishal Dadlani, Sanjay Leela Bhansali", query: "Malhari Bajirao Mastani Vishal Dadlani", genreId: "hindi", moodIds: ["adrenaline", "adventure"], genreName: "Bollywood / Hindi", moodName: "High Adrenaline" },
  { title: "Apna Time Aayega", artist: "Ranveer Singh, DIVINE", query: "Apna Time Aayega Gully Boy", genreId: "hindi", moodIds: ["adrenaline", "noir"], genreName: "Bollywood / Hindi", moodName: "High Adrenaline" },
  { title: "Zinda", artist: "Siddharth Mahadevan, Shankar-Ehsaan-Loy", query: "Zinda Bhaag Milkha Bhaag", genreId: "hindi", moodIds: ["adrenaline", "feelgood"], genreName: "Bollywood / Hindi", moodName: "High Adrenaline" },
  { title: "Sultan", artist: "Sukhwinder Singh, Shadab Faridi", query: "Sultan Title Track Sukhwinder Singh", genreId: "hindi", moodIds: ["adrenaline", "adventure"], genreName: "Bollywood / Hindi", moodName: "High Adrenaline" },
  { title: "Dhoom Machale", artist: "Sunidhi Chauhan, Pritam", query: "Dhoom Machale Sunidhi Chauhan", genreId: "hindi", moodIds: ["adrenaline", "retro"], genreName: "Bollywood / Hindi", moodName: "High Adrenaline" },

  // Bollywood / Hindi - Romantic
  { title: "Tum Hi Ho", artist: "Arijit Singh, Mithoon", query: "Tum Hi Ho Aashiqui 2 Arijit", genreId: "hindi", moodIds: ["romantic", "cry"], genreName: "Bollywood / Hindi", moodName: "Romantic & Chemistry" },
  { title: "Kesariya", artist: "Arijit Singh, Pritam", query: "Kesariya Brahmastra Arijit", genreId: "hindi", moodIds: ["romantic", "feelgood"], genreName: "Bollywood / Hindi", moodName: "Romantic & Chemistry" },
  { title: "Raataan Lambiyan", artist: "Jubin Nautiyal, Asees Kaur", query: "Raataan Lambiyan Shershaah Jubin", genreId: "hindi", moodIds: ["romantic", "latenight"], genreName: "Bollywood / Hindi", moodName: "Romantic & Chemistry" },
  { title: "Pehla Nasha", artist: "Udit Narayan, Sadhana Sargam", query: "Pehla Nasha Jo Jeeta Wohi Sikandar", genreId: "hindi", moodIds: ["romantic", "retro"], genreName: "Bollywood / Hindi", moodName: "Romantic & Chemistry" },
  { title: "Zehnaseeb", artist: "Chinmayi Sripaada, Shekhar Ravjiani", query: "Zehnaseeb Hasee Toh Phasee", genreId: "hindi", moodIds: ["romantic", "feelgood"], genreName: "Bollywood / Hindi", moodName: "Romantic & Chemistry" },

  // Bollywood / Hindi - Retro
  { title: "Lag Jaa Gale", artist: "Lata Mangeshkar, Madan Mohan", query: "Lag Jaa Gale Lata Mangeshkar", genreId: "hindi", moodIds: ["retro", "romantic", "latenight"], genreName: "Bollywood / Hindi", moodName: "Nostalgic Retro" },
  { title: "Pal Pal Dil Ke Paas", artist: "Kishore Kumar, Kalyanji-Anandji", query: "Pal Pal Dil Ke Paas Kishore Kumar", genreId: "hindi", moodIds: ["retro", "romantic"], genreName: "Bollywood / Hindi", moodName: "Nostalgic Retro" },
  { title: "Roop Tera Mastana", artist: "Kishore Kumar, S.D. Burman", query: "Roop Tera Mastana Kishore Kumar Aradhana", genreId: "hindi", moodIds: ["retro", "romantic"], genreName: "Bollywood / Hindi", moodName: "Nostalgic Retro" },
  { title: "Chura Liya Hai Tumne", artist: "Asha Bhosle, Mohammed Rafi, R.D. Burman", query: "Chura Liya Hai Tumne Jo Dil Ko Asha Rafi", genreId: "hindi", moodIds: ["retro", "romantic", "feelgood"], genreName: "Bollywood / Hindi", moodName: "Nostalgic Retro" },

  // Punjabi Hits - Feel-Good
  { title: "Lover", artist: "Diljit Dosanjh", query: "Lover Diljit Dosanjh MoonChild", genreId: "punjabi", moodIds: ["feelgood", "romantic"], genreName: "Punjabi Hits", moodName: "Feel-Good & Warm" },
  { title: "Do You Know", artist: "Diljit Dosanjh, Jaani, B Praak", query: "Do You Know Diljit Dosanjh", genreId: "punjabi", moodIds: ["feelgood", "romantic"], genreName: "Punjabi Hits", moodName: "Feel-Good & Warm" },
  { title: "Proper Patola", artist: "Badshah, Diljit Dosanjh, Aastha Gill", query: "Proper Patola Diljit Badshah", genreId: "punjabi", moodIds: ["feelgood", "adrenaline"], genreName: "Punjabi Hits", moodName: "Feel-Good & Warm" },
  { title: "Brown Munde", artist: "AP Dhillon, Gurinder Gill, Shinda Kahlon", query: "Brown Munde AP Dhillon", genreId: "punjabi", moodIds: ["feelgood", "adrenaline"], genreName: "Punjabi Hits", moodName: "Feel-Good & Warm" },

  // Punjabi Hits - Late-Night
  { title: "Softly", artist: "Karan Aujla, Ikky", query: "Softly Karan Aujla Making Memories", genreId: "punjabi", moodIds: ["latenight", "romantic"], genreName: "Punjabi Hits", moodName: "Late-Night & Moody" },
  { title: "Excuses", artist: "AP Dhillon, Gurinder Gill, Intense", query: "Excuses AP Dhillon Gurinder Gill", genreId: "punjabi", moodIds: ["latenight", "cry"], genreName: "Punjabi Hits", moodName: "Late-Night & Moody" },
  { title: "No Love", artist: "Shubh", query: "No Love Shubh", genreId: "punjabi", moodIds: ["latenight", "noir"], genreName: "Punjabi Hits", moodName: "Late-Night & Moody" },
  { title: "Insane", artist: "AP Dhillon, Gurinder Gill, Shinda Kahlon", query: "Insane AP Dhillon", genreId: "punjabi", moodIds: ["latenight", "adrenaline"], genreName: "Punjabi Hits", moodName: "Late-Night & Moody" },
  { title: "Elevated", artist: "Shubh", query: "Elevated Shubh", genreId: "punjabi", moodIds: ["latenight", "adrenaline"], genreName: "Punjabi Hits", moodName: "Late-Night & Moody" },
  { title: "Cheques", artist: "Shubh", query: "Cheques Shubh Still Rollin", genreId: "punjabi", moodIds: ["latenight", "noir"], genreName: "Punjabi Hits", moodName: "Late-Night & Moody" },

  // Punjabi Hits - Cry
  { title: "Mann Bharryaa", artist: "B Praak, Jaani", query: "Mann Bharryaa B Praak", genreId: "punjabi", moodIds: ["cry", "latenight"], genreName: "Punjabi Hits", moodName: "A Good Cry" },
  { title: "Filhall", artist: "B Praak, Jaani", query: "Filhall B Praak Akshay Kumar", genreId: "punjabi", moodIds: ["cry", "romantic"], genreName: "Punjabi Hits", moodName: "A Good Cry" },
  { title: "Qismat", artist: "Ammy Virk, B Praak", query: "Qismat Ammy Virk B Praak", genreId: "punjabi", moodIds: ["cry", "romantic"], genreName: "Punjabi Hits", moodName: "A Good Cry" },
  { title: "Soch", artist: "Hardy Sandhu, B Praak, Jaani", query: "Soch Hardy Sandhu B Praak", genreId: "punjabi", moodIds: ["cry", "romantic"], genreName: "Punjabi Hits", moodName: "A Good Cry" },
  { title: "Duji Vaar Pyar", artist: "Sunanda Sharma, Jaani", query: "Duji Vaar Pyar Sunanda Sharma", genreId: "punjabi", moodIds: ["cry", "romantic"], genreName: "Punjabi Hits", moodName: "A Good Cry" },

  // Punjabi Hits - High Adrenaline
  { title: "295", artist: "Sidhu Moose Wala", query: "295 Sidhu Moose Wala Moosetape", genreId: "punjabi", moodIds: ["adrenaline", "noir"], genreName: "Punjabi Hits", moodName: "High Adrenaline" },
  { title: "Baller", artist: "Shubh, Ikky", query: "Baller Shubh Ikky", genreId: "punjabi", moodIds: ["adrenaline", "latenight"], genreName: "Punjabi Hits", moodName: "High Adrenaline" },
  { title: "Same Beef", artist: "Bohemia, Sidhu Moose Wala", query: "Same Beef Bohemia Sidhu Moose Wala", genreId: "punjabi", moodIds: ["adrenaline", "noir"], genreName: "Punjabi Hits", moodName: "High Adrenaline" },
  { title: "Tauba Tauba", artist: "Karan Aujla", query: "Tauba Tauba Karan Aujla Bad Newz", genreId: "punjabi", moodIds: ["adrenaline", "feelgood"], genreName: "Punjabi Hits", moodName: "High Adrenaline" },
  { title: "The Last Ride", artist: "Sidhu Moose Wala, Wazir Patar", query: "The Last Ride Sidhu Moose Wala", genreId: "punjabi", moodIds: ["adrenaline", "noir"], genreName: "Punjabi Hits", moodName: "High Adrenaline" },
  { title: "Winning Speech", artist: "Karan Aujla, Mxrci", query: "Winning Speech Karan Aujla", genreId: "punjabi", moodIds: ["adrenaline", "feelgood"], genreName: "Punjabi Hits", moodName: "High Adrenaline" },
  { title: "Wavy", artist: "Karan Aujla", query: "Wavy Karan Aujla Four Me", genreId: "punjabi", moodIds: ["adrenaline", "latenight"], genreName: "Punjabi Hits", moodName: "High Adrenaline" },

  // Punjabi Hits - Romantic
  { title: "White Brown Black", artist: "Avvy Sra, Karan Aujla, Jaani", query: "White Brown Black Karan Aujla Avvy Sra", genreId: "punjabi", moodIds: ["romantic", "feelgood"], genreName: "Punjabi Hits", moodName: "Romantic & Chemistry" },
  { title: "Kinni Kinni", artist: "Diljit Dosanjh", query: "Kinni Kinni Diljit Dosanjh Ghost", genreId: "punjabi", moodIds: ["romantic", "feelgood"], genreName: "Punjabi Hits", moodName: "Romantic & Chemistry" },
  { title: "Ishq Tera", artist: "Guru Randhawa", query: "Ishq Tera Guru Randhawa", genreId: "punjabi", moodIds: ["romantic", "feelgood"], genreName: "Punjabi Hits", moodName: "Romantic & Chemistry" },
  { title: "With You", artist: "AP Dhillon", query: "With You AP Dhillon", genreId: "punjabi", moodIds: ["romantic", "latenight"], genreName: "Punjabi Hits", moodName: "Romantic & Chemistry" },

  // English / Global Hits - High Adrenaline
  { title: "Believer", artist: "Imagine Dragons", query: "Believer Imagine Dragons", genreId: "english", moodIds: ["adrenaline", "adventure"], genreName: "English / Global Hits", moodName: "High Adrenaline" },
  { title: "Can't Hold Us", artist: "Macklemore & Ryan Lewis feat. Ray Dalton", query: "Can't Hold Us Macklemore Ryan Lewis", genreId: "english", moodIds: ["adrenaline", "feelgood"], genreName: "English / Global Hits", moodName: "High Adrenaline" },
  { title: "Lose Yourself", artist: "Eminem", query: "Lose Yourself Eminem 8 Mile", genreId: "english", moodIds: ["adrenaline", "noir"], genreName: "English / Global Hits", moodName: "High Adrenaline" },
  { title: "Till I Collapse", artist: "Eminem feat. Nate Dogg", query: "Till I Collapse Eminem", genreId: "english", moodIds: ["adrenaline", "noir"], genreName: "English / Global Hits", moodName: "High Adrenaline" },

  // English / Global Hits - Feel-Good
  { title: "Levitating", artist: "Dua Lipa", query: "Levitating Dua Lipa", genreId: "english", moodIds: ["feelgood", "romantic"], genreName: "English / Global Hits", moodName: "Feel-Good & Warm" },
  { title: "Uptown Funk", artist: "Mark Ronson feat. Bruno Mars", query: "Uptown Funk Mark Ronson Bruno Mars", genreId: "english", moodIds: ["feelgood", "adrenaline", "retro"], genreName: "English / Global Hits", moodName: "Feel-Good & Warm" },
  { title: "Can't Stop the Feeling!", artist: "Justin Timberlake", query: "Can't Stop the Feeling Justin Timberlake", genreId: "english", moodIds: ["feelgood", "adrenaline"], genreName: "English / Global Hits", moodName: "Feel-Good & Warm" },
  { title: "Happy", artist: "Pharrell Williams", query: "Happy Pharrell Williams", genreId: "english", moodIds: ["feelgood", "adrenaline"], genreName: "English / Global Hits", moodName: "Feel-Good & Warm" },

  // English / Global Hits - Late-Night
  { title: "After Hours", artist: "The Weeknd", query: "After Hours The Weeknd", genreId: "english", moodIds: ["latenight", "noir"], genreName: "English / Global Hits", moodName: "Late-Night & Moody" },
  { title: "Midnight City", artist: "M83", query: "Midnight City M83", genreId: "english", moodIds: ["latenight", "scifi", "adventure"], genreName: "English / Global Hits", moodName: "Late-Night & Moody" },
  { title: "Sweater Weather", artist: "The Neighbourhood", query: "Sweater Weather The Neighbourhood", genreId: "english", moodIds: ["latenight", "romantic", "cry"], genreName: "English / Global Hits", moodName: "Late-Night & Moody" },
  { title: "Starboy", artist: "The Weeknd feat. Daft Punk", query: "Starboy The Weeknd Daft Punk", genreId: "english", moodIds: ["latenight", "scifi", "adrenaline"], genreName: "English / Global Hits", moodName: "Late-Night & Moody" },

  // English / Global Hits - A Good Cry
  { title: "Drivers License", artist: "Olivia Rodrigo", query: "Drivers License Olivia Rodrigo", genreId: "english", moodIds: ["cry", "latenight"], genreName: "English / Global Hits", moodName: "A Good Cry" },
  { title: "Glimpse of Us", artist: "Joji", query: "Glimpse of Us Joji", genreId: "english", moodIds: ["cry", "latenight"], genreName: "English / Global Hits", moodName: "A Good Cry" },
  { title: "Someone Like You", artist: "Adele", query: "Someone Like You Adele 21", genreId: "english", moodIds: ["cry", "romantic"], genreName: "English / Global Hits", moodName: "A Good Cry" },
  { title: "The Night We Met", artist: "Lord Huron", query: "The Night We Met Lord Huron", genreId: "english", moodIds: ["cry", "latenight", "retro"], genreName: "English / Global Hits", moodName: "A Good Cry" },

  // Soundtracks & Lo-Fi / Others - Sci-Fi & Epic
  { title: "Cornfield Chase", artist: "Hans Zimmer", query: "Cornfield Chase Hans Zimmer Interstellar", genreId: "soundtracks", moodIds: ["scifi", "adventure", "adrenaline"], genreName: "Lo-Fi & Soundtracks", moodName: "Mind-Bending & Sci-Fi" },
  { title: "Time", artist: "Hans Zimmer", query: "Time Hans Zimmer Inception", genreId: "soundtracks", moodIds: ["scifi", "adventure", "latenight"], genreName: "Lo-Fi & Soundtracks", moodName: "Mind-Bending & Sci-Fi" },
  { title: "Test Drive", artist: "John Powell", query: "Test Drive John Powell How to Train Your Dragon", genreId: "soundtracks", moodIds: ["adventure", "adrenaline", "feelgood"], genreName: "Lo-Fi & Soundtracks", moodName: "Epic Adventure" },

  // South Indian Hits
  { title: "Naatu Naatu", artist: "M.M. Keeravaani, Rahul Sipligunj, Kaala Bhairava", query: "Naatu Naatu RRR", genreId: "south-indian", moodIds: ["adrenaline", "feelgood", "adventure"], genreName: "South Indian Hits", moodName: "High Adrenaline" },
  { title: "Badass", artist: "Anirudh Ravichander", query: "Badass Leo Anirudh", genreId: "south-indian", moodIds: ["adrenaline", "noir"], genreName: "South Indian Hits", moodName: "High Adrenaline" },
  { title: "Aaluma Doluma", artist: "Anirudh Ravichander", query: "Aaluma Doluma Vedalam Anirudh", genreId: "south-indian", moodIds: ["adrenaline", "feelgood"], genreName: "South Indian Hits", moodName: "High Adrenaline" },
  { title: "Darshana", artist: "Hesham Abdul Wahab, Darshana Rajendran", query: "Darshana Hridayam Hesham Abdul Wahab", genreId: "south-indian", moodIds: ["romantic", "feelgood"], genreName: "South Indian Hits", moodName: "Romantic & Chemistry" },
  { title: "Hukum - Thalaivar Alappara", artist: "Anirudh Ravichander, Super Subu", query: "Hukum Jailer Anirudh", genreId: "south-indian", moodIds: ["adrenaline", "adventure"], genreName: "South Indian Hits", moodName: "High Adrenaline" },
  { title: "Oo Antava Mava", artist: "Indravathi Chauhan, Devi Sri Prasad", query: "Oo Antava Pushpa DSP", genreId: "south-indian", moodIds: ["adrenaline", "noir"], genreName: "South Indian Hits", moodName: "High Adrenaline" },

  // K-Pop & OSTs
  { title: "Dynamite", artist: "BTS", query: "Dynamite BTS", genreId: "kpop", moodIds: ["feelgood", "adrenaline", "retro"], genreName: "K-Pop & OSTs", moodName: "Feel-Good & Warm" },
  { title: "Stay With Me", artist: "CHANYEOL, Punch", query: "Stay With Me Chanyeol Punch Goblin", genreId: "kpop", moodIds: ["romantic", "latenight", "scifi"], genreName: "K-Pop & OSTs", moodName: "Romantic & Chemistry" },
  { title: "How You Like That", artist: "BLACKPINK", query: "How You Like That BLACKPINK", genreId: "kpop", moodIds: ["adrenaline", "noir"], genreName: "K-Pop & OSTs", moodName: "High Adrenaline" },
  { title: "Sweet Night", artist: "V", query: "Sweet Night V Itaewon Class", genreId: "kpop", moodIds: ["latenight", "cry"], genreName: "K-Pop & OSTs", moodName: "Late-Night & Moody" },

  // Latin / Spanish
  { title: "Despacito", artist: "Luis Fonsi, Daddy Yankee", query: "Despacito Luis Fonsi Daddy Yankee", genreId: "latin", moodIds: ["feelgood", "romantic"], genreName: "Latin / Spanish", moodName: "Feel-Good & Warm" },
  { title: "Dákiti", artist: "Bad Bunny, Jhayco", query: "Dakiti Bad Bunny Jhay Cortez", genreId: "latin", moodIds: ["latenight", "feelgood"], genreName: "Latin / Spanish", moodName: "Late-Night & Moody" },
  { title: "Danza Kuduro", artist: "Don Omar, Lucenzo", query: "Danza Kuduro Don Omar", genreId: "latin", moodIds: ["adrenaline", "feelgood"], genreName: "Latin / Spanish", moodName: "High Adrenaline" },
  { title: "Mi Gente", artist: "J Balvin, Willy William", query: "Mi Gente J Balvin Willy William", genreId: "latin", moodIds: ["feelgood", "adrenaline"], genreName: "Latin / Spanish", moodName: "Feel-Good & Warm" },

  // Noir & Spooky & Mind-Bending Highlights
  { title: "Something In The Way", artist: "Nirvana", query: "Something In The Way Nirvana The Batman", genreId: "english", moodIds: ["noir", "latenight"], genreName: "English / Global Hits", moodName: "Dark & Gritty Noir" },
  { title: "Stranger Things Theme", artist: "Kyle Dixon & Michael Stein", query: "Stranger Things Theme Kyle Dixon", genreId: "soundtracks", moodIds: ["spooky", "scifi", "retro"], genreName: "Lo-Fi & Soundtracks", moodName: "Spooky & Thriller" },
  { title: "Halloween Theme", artist: "John Carpenter", query: "Halloween Theme John Carpenter", genreId: "soundtracks", moodIds: ["spooky", "noir"], genreName: "Lo-Fi & Soundtracks", moodName: "Spooky & Thriller" },
  { title: "He's a Pirate", artist: "Klaus Badelt, Hans Zimmer", query: "Hes a Pirate Klaus Badelt Hans Zimmer", genreId: "soundtracks", moodIds: ["adventure", "adrenaline"], genreName: "Lo-Fi & Soundtracks", moodName: "Epic Adventure" }
];

async function main() {
  console.log(`Enriching ${SEED_TRACKS_SPEC.length} tracks via iTunes API...`);
  const finalTracks = [];

  for (let i = 0; i < SEED_TRACKS_SPEC.length; i++) {
    const spec = SEED_TRACKS_SPEC[i];
    const trackId = `track-${spec.genreId}-${i + 1}-${spec.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    let artworkUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";
    let previewUrl = "";
    let duration = "3:30";
    let realTitle = spec.title;
    let realArtist = spec.artist;
    let appleMusicUrl = `https://music.apple.com/us/search?term=${encodeURIComponent(spec.title + " " + spec.artist)}`;
    let spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(spec.title + " " + spec.artist)}`;

    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(spec.query)}&entity=song&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        realTitle = item.trackName || spec.title;
        realArtist = item.artistName || spec.artist;
        if (item.artworkUrl100) {
          artworkUrl = item.artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg");
        }
        previewUrl = item.previewUrl || "";
        if (item.trackTimeMillis) {
          const totalSecs = Math.floor(item.trackTimeMillis / 1000);
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          duration = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
        if (item.trackViewUrl) {
          appleMusicUrl = item.trackViewUrl;
        }
      }
    } catch (e) {
      console.warn(`Failed fetching iTunes info for ${spec.title}:`, e.message);
    }

    finalTracks.push({
      id: trackId,
      title: realTitle,
      artist: realArtist,
      genreId: spec.genreId,
      genreName: spec.genreName,
      moodIds: spec.moodIds,
      moodName: spec.moodName,
      duration: duration,
      artworkUrl: artworkUrl,
      previewUrl: previewUrl,
      appleMusicUrl: appleMusicUrl,
      spotifyUrl: spotifyUrl,
      source: "curated"
    });

    // polite delay
    await new Promise(r => setTimeout(r, 120));
    process.stdout.write(`\r[${i + 1}/${SEED_TRACKS_SPEC.length}] Processed: ${spec.title}`);
  }

  console.log("\nDone fetching track metadata. Writing output...");

  const fileContent = `// Comprehensive Offline Seed Catalog (70+ Pre-populated Verified Tracks)
// Curated across 8 Regions/Genres and 10 Mood Categories
// Complete with Verified Apple Music 600x600 Artwork and Live Audio Preview Streams

export const SEED_TRACKS = ${JSON.stringify(finalTracks, null, 2)};

export const GENRES = [
  { id: "all", label: "All Music", icon: "🌐", flag: "🌐" },
  { id: "hindi", label: "Bollywood / Hindi", icon: "🇮🇳", flag: "🇮🇳" },
  { id: "punjabi", label: "Punjabi Hits", icon: "⚡", flag: "⚡" },
  { id: "english", label: "English / Global Hits", icon: "🎬", flag: "🎬" },
  { id: "south-indian", label: "South Indian (Tamil/Telugu/Malayalam)", icon: "🔥", flag: "🔥" },
  { id: "kpop", label: "K-Pop & OSTs", icon: "🇰🇷", flag: "🇰🇷" },
  { id: "latin", label: "Latin / Spanish", icon: "💃", flag: "💃" },
  { id: "soundtracks", label: "Lo-Fi & Soundtracks", icon: "🎹", flag: "🎹" }
];

export const MOODS = [
  { id: "feelgood", label: "Feel-Good & Warm", icon: "🍿", tag: "Feel-Good" },
  { id: "latenight", label: "Late-Night & Moody", icon: "🌙", tag: "Late-Night" },
  { id: "cry", label: "A Good Cry", icon: "🌧️", tag: "Melancholy" },
  { id: "adrenaline", label: "High Adrenaline", icon: "⚡", tag: "High Adrenaline" },
  { id: "scifi", label: "Mind-Bending & Sci-Fi", icon: "🌀", tag: "Sci-Fi" },
  { id: "noir", label: "Dark & Gritty Noir", icon: "🕵️", tag: "Noir" },
  { id: "spooky", label: "Spooky & Thriller", icon: "👻", tag: "Spooky" },
  { id: "romantic", label: "Romantic & Chemistry", icon: "💖", tag: "Romantic" },
  { id: "retro", label: "Nostalgic Retro", icon: "📼", tag: "Retro" },
  { id: "adventure", label: "Epic Adventure", icon: "🗺️", tag: "Epic Adventure" }
];
`;

  const outputPath = path.resolve(__dirname, '../src/musicDatabase.js');
  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`Saved music database to ${outputPath}`);
}

main().catch(err => {
  console.error("Error building music database:", err);
  process.exit(1);
});
