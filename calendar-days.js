/* ==========================================================================
   1. INTERNATIONAL & WORLD DAYS DATABASE (FULL YEAR EDITION)
   ========================================================================== */

const specialObservances = {
    "1-1": [
        {
            name: "New Year's Day",
            official: true
        },
        {
            name: "Global Family Day",
            official: true
        },
        {
            name: "World Day of Peace",
            official: true
        },
        {
            name: "Polar Bear Plunge Day",
            official: false
        },
        {
            name: "Euro Day",
            official: false
        }
    ],
    "1-2": [
        {
            name: "World Introvert Day",
            official: false
        },
        {
            name: "Science Fiction Day",
            official: false
        },
        {
            name: "National Cream Puff Day",
            official: false
        }
    ],
    "1-3": [
        {
            name: "Festival of Sleep Day",
            official: false
        },
        {
            name: "International Mind-Body Wellness Day",
            official: false
        },
        {
            name: "World Chocolate Covered Cherry Day",
            official: false
        }
    ],
    "1-4": [
        {
            name: "World Braille Day",
            official: true
        },
        {
            name: "World Hypnotism Day",
            official: false
        },
        {
            name: "National Trivia Day",
            official: false
        }
    ],
    "1-5": [
        {
            name: "National Bird Day",
            official: false
        },
        {
            name: "World Whipped Cream Day",
            official: false
        },
        {
            name: "International Screenwriters Day",
            official: false
        }
    ],
    "1-6": [
        {
            name: "World Technology Day",
            official: false
        },
        {
            name: "National Bean Day",
            official: false
        },
        {
            name: "Apple Tree Day",
            official: false
        }
    ],
    "1-7": [
        {
            name: "World Stamp Collecting Day",
            official: false
        },
        {
            name: "International Programmers' Day",
            official: false
        },
        {
            name: "National Bobblehead Day",
            official: false
        }
    ],
    "1-8": [
        {
            name: "World Typing Day",
            official: false
        },
        {
            name: "Earth's Rotation Day",
            official: false
        },
        {
            name: "Joy Germ Day",
            official: false
        }
    ],
    "1-9": [
        {
            name: "International Static Electricity Day",
            official: false
        },
        {
            name: "World Apricot Day",
            official: false
        },
        {
            name: "Word Nerd Day",
            official: false
        }
    ],
    "1-10": [
        {
            name: "World Cut Your Energy Costs Day",
            official: false
        },
        {
            name: "World Tintin Day",
            official: false
        },
        {
            name: "Houseplant Appreciation Day",
            official: false
        }
    ],
    "1-11": [
        {
            name: "International Thank You Day",
            official: false
        },
        {
            name: "Learn Your Name in Morse Code Day",
            official: false
        },
        {
            name: "World Milk Day (US)",
            official: false
        }
    ],
    "1-12": [
        {
            name: "World Marzipan Day",
            official: false
        },
        {
            name: "International Kiss A Ginger Day",
            official: false
        },
        {
            name: "National Pharmacist Day",
            official: false
        }
    ],
    "1-13": [
        {
            name: "International Rubber Duck Day",
            official: false
        },
        {
            name: "Make Your Dreams Come True Day",
            official: false
        },
        {
            name: "World Sticker Day",
            official: false
        }
    ],
    "1-14": [
        {
            name: "World Logic Day",
            official: true
        },
        {
            name: "International Kite Day",
            official: false
        },
        {
            name: "National Dress Up Your Pet Day",
            official: false
        }
    ],
    "1-15": [
        {
            name: "Wikipedia Day",
            official: false
        },
        {
            name: "World Hat Day",
            official: false
        },
        {
            name: "National Bagel Day",
            official: false
        }
    ],
    "1-16": [
        {
            name: "International Hot and Spicy Food Day",
            official: false
        },
        {
            name: "World Religion Day",
            official: false
        },
        {
            name: "National Nothing Day",
            official: false
        }
    ],
    "1-17": [
        {
            name: "World Pizza Day",
            official: false
        },
        {
            name: "Kid Inventors' Day",
            official: false
        },
        {
            name: "Customer Service Day",
            official: false
        }
    ],
    "1-18": [
        {
            name: "World Snow Day",
            official: false
        },
        {
            name: "Museum Selfie Day",
            official: false
        },
        {
            name: "Winnie the Pooh Day",
            official: false
        }
    ],
    "1-19": [
        {
            name: "World Popcorn Day",
            official: false
        },
        {
            name: "National Tin Can Day",
            official: false
        }
    ],
    "1-20": [
        {
            name: "World Penguin Day",
            official: false
        },
        {
            name: "International Day of Acceptance",
            official: false
        },
        {
            name: "National Cheese Lover's Day",
            official: false
        }
    ],
    "1-21": [
        {
            name: "International Hug Day",
            official: false
        },
        {
            name: "World Squirrel Day",
            official: false
        },
        {
            name: "Playdate Day",
            official: false
        }
    ],
    "1-22": [
        {
            name: "World Hot Sauce Day",
            official: false
        },
        {
            name: "National Answer Your Cat's Questions Day",
            official: false
        }
    ],
    "1-23": [
        {
            name: "World Pie Day",
            official: false
        },
        {
            name: "World Handwriting Day",
            official: false
        },
        {
            name: "Community Manager Appreciation Day",
            official: false
        }
    ],
    "1-24": [
        {
            name: "International Day of Education",
            official: true
        },
        {
            name: "World Compliment Day",
            official: false
        },
        {
            name: "National Peanut Butter Day",
            official: false
        }
    ],
    "1-25": [
        {
            name: "Opposite Day",
            official: false
        },
        {
            name: "World Irish Coffee Day",
            official: false
        },
        {
            name: "Macintosh Computer Day",
            official: false
        }
    ],
    "1-26": [
        {
            name: "International Customs Day",
            official: true
        },
        {
            name: "World Environmental Education Day",
            official: false
        },
        {
            name: "Spouse's Day",
            official: false
        }
    ],
    "1-27": [
        {
            name: "World Chocolate Cake Day",
            official: false
        },
        {
            name: "International Port Wine Day",
            official: false
        }
    ],
    "1-28": [
        {
            name: "Data Privacy Day",
            official: true
        },
        {
            name: "World Lego Day",
            official: false
        },
        {
            name: "Global Community Engagement Day",
            official: false
        }
    ],
    "1-29": [
        {
            name: "World Puzzle Day",
            official: false
        },
        {
            name: "National Corn Chip Day",
            official: false
        }
    ],
    "1-30": [
        {
            name: "World Leprosy Day",
            official: true
        },
        {
            name: "World Neglected Tropical Diseases Day",
            official: true
        },
        {
            name: "World Croissant Day",
            official: false
        }
    ],
    "1-31": [
        {
            name: "World Zebra Day",
            official: false
        },
        {
            name: "International Magician's Day",
            official: false
        },
        {
            name: "Backward Day",
            official: false
        }
    ],
    "2-1": [
        {
            name: "World Read Aloud Day",
            official: false
        },
        {
            name: "Freedom Day",
            official: false
        },
        {
            name: "Baked Alaska Day",
            official: false
        }
    ],
    "2-2": [
        {
            name: "World Wetlands Day",
            official: true
        },
        {
            name: "Groundhog Day",
            official: false
        },
        {
            name: "World Crepe Day",
            official: false
        }
    ],
    "2-3": [
        {
            name: "World Carrot Cake Day",
            official: false
        },
        {
            name: "International Golden Retriever Day",
            official: false
        }
    ],
    "2-4": [
        {
            name: "World Cancer Day",
            official: true
        },
        {
            name: "International Day of Human Fraternity",
            official: true
        },
        {
            name: "National Homemade Soup Day",
            official: false
        }
    ],
    "2-5": [
        {
            name: "World Nutella Day",
            official: false
        },
        {
            name: "World Weatherperson's Day",
            official: false
        }
    ],
    "2-6": [
        {
            name: "World Frozen Yogurt Day",
            official: false
        },
        {
            name: "International Chopsticks Day",
            official: false
        }
    ],
    "2-7": [
        {
            name: "World Send a Card to a Friend Day",
            official: false
        },
        {
            name: "National Periodic Table Day",
            official: false
        }
    ],
    "2-8": [
        {
            name: "World Opera Day",
            official: false
        },
        {
            name: "Proposing Day",
            official: false
        },
        {
            name: "Boy Scouts Day",
            official: false
        }
    ],
    "2-9": [
        {
            name: "World Pizza Day",
            official: false
        },
        {
            name: "International Toothache Day",
            official: false
        }
    ],
    "2-10": [
        {
            name: "World Pulses Day",
            official: true
        },
        {
            name: "World Umbrella Day",
            official: false
        }
    ],
    "2-11": [
        {
            name: "International Day of Women and Girls in Science",
            official: true
        },
        {
            name: "World Day of the Sick",
            official: true
        },
        {
            name: "Don't Cry Over Spilled Milk Day",
            official: false
        }
    ],
    "2-12": [
        {
            name: "Darwin Day",
            official: false
        },
        {
            name: "World Plum Pudding Day",
            official: false
        }
    ],
    "2-13": [
        {
            name: "World Radio Day",
            official: true
        },
        {
            name: "Galentine's Day",
            official: false
        },
        {
            name: "World Self-Love Day",
            official: false
        }
    ],
    "2-14": [
        {
            name: "Valentine's Day",
            official: false
        },
        {
            name: "International Book Giving Day",
            official: false
        },
        {
            name: "World Ferris Wheel Day",
            official: false
        }
    ],
    "2-15": [
        {
            name: "International Childhood Cancer Day",
            official: true
        },
        {
            name: "World Hippo Day",
            official: false
        },
        {
            name: "Singles Awareness Day",
            official: false
        }
    ],
    "2-16": [
        {
            name: "World Pangolin Day",
            official: false
        },
        {
            name: "World Innovation Day",
            official: false
        },
        {
            name: "World Almond Day",
            official: false
        }
    ],
    "2-17": [
        {
            name: "Random Acts of Kindness Day",
            official: false
        },
        {
            name: "World Cabbage Day",
            official: false
        }
    ],
    "2-18": [
        {
            name: "World Whale Day",
            official: false
        },
        {
            name: "World Battery Day",
            official: false
        },
        {
            name: "Pluto Day",
            official: false
        }
    ],
    "2-19": [
        {
            name: "World Chocolate Mint Day",
            official: false
        },
        {
            name: "International Tug-of-War Day",
            official: false
        }
    ],
    "2-20": [
        {
            name: "World Day of Social Justice",
            official: true
        },
        {
            name: "Love Your Pet Day",
            official: false
        },
        {
            name: "World Muffin Day",
            official: false
        }
    ],
    "2-21": [
        {
            name: "International Mother Language Day",
            official: true
        },
        {
            name: "World Information Architecture Day",
            official: false
        }
    ],
    "2-22": [
        {
            name: "World Thinking Day",
            official: false
        },
        {
            name: "World Yoga Day",
            official: false
        },
        {
            name: "World Margarita Day",
            official: false
        }
    ],
    "2-23": [
        {
            name: "World Understanding and Peace Day",
            official: false
        },
        {
            name: "International Dog Biscuit Day",
            official: false
        }
    ],
    "2-24": [
        {
            name: "World Bartender Day",
            official: false
        },
        {
            name: "World Tortilla Chip Day",
            official: false
        }
    ],
    "2-25": [
        {
            name: "World Clam Chowder Day",
            official: false
        },
        {
            name: "International Pancake Day",
            official: false
        }
    ],
    "2-26": [
        {
            name: "World Pistachio Day",
            official: false
        },
        {
            name: "Tell a Fairy Tale Day",
            official: false
        }
    ],
    "2-27": [
        {
            name: "World NGO Day",
            official: true
        },
        {
            name: "World Polar Bear Day",
            official: false
        },
        {
            name: "World Pokémon Day",
            official: false
        }
    ],
    "2-28": [
        {
            name: "World Rare Disease Day",
            official: true
        },
        {
            name: "Global Sleeping in Public Day",
            official: false
        }
    ],
    "3-1": [
        {
            name: "Zero Discrimination Day",
            official: true
        },
        {
            name: "World Seagrass Day",
            official: true
        },
        {
            name: "World Civil Defence Day",
            official: true
        },
        {
            name: "World Compliment Day",
            official: false
        }
    ],
    "3-2": [
        {
            name: "World Book Day",
            official: false
        },
        {
            name: "International Rescue Cat Day",
            official: false
        }
    ],
    "3-3": [
        {
            name: "World Wildlife Day",
            official: true
        },
        {
            name: "World Hearing Day",
            official: true
        },
        {
            name: "International Writers' Day",
            official: false
        }
    ],
    "3-4": [
        {
            name: "World Engineering Day for Sustainable Development",
            official: true
        },
        {
            name: "World Obesity Day",
            official: true
        },
        {
            name: "World Tennis Day",
            official: false
        },
        {
            name: "International Grammar Day",
            official: false
        }
    ],
    "3-5": [
        {
            name: "World Energy Efficiency Day",
            official: false
        },
        {
            name: "International Day for Disarmament and Non-Proliferation Awareness",
            official: true
        }
    ],
    "3-6": [
        {
            name: "World Frozen Food Day",
            official: false
        },
        {
            name: "National Oreo Cookie Day",
            official: false
        }
    ],
    "3-7": [
        {
            name: "World Cereal Day",
            official: false
        },
        {
            name: "National Crown Roast of Pork Day",
            official: false
        }
    ],
    "3-8": [
        {
            name: "International Women's Day",
            official: true
        },
        {
            name: "World Maths Day",
            official: false
        },
        {
            name: "National Proofreading Day",
            official: false
        }
    ],
    "3-9": [
        {
            name: "World DJ Day",
            official: false
        },
        {
            name: "Barbie Day",
            official: false
        },
        {
            name: "Get Over It Day",
            official: false
        }
    ],
    "3-10": [
        {
            name: "Mario Day (Mar10)",
            official: false
        },
        {
            name: "International Day of Women Judges",
            official: true
        },
        {
            name: "World Bagpipe Day",
            official: false
        }
    ],
    "3-11": [
        {
            name: "World Plumbing Day",
            official: false
        },
        {
            name: "National Oatmeal Nut Waffle Day",
            official: false
        }
    ],
    "3-12": [
        {
            name: "World Glaucoma Day",
            official: false
        },
        {
            name: "Plant a Flower Day",
            official: false
        }
    ],
    "3-13": [
        {
            name: "World Sleep Day",
            official: false
        },
        {
            name: "International Jewel Day",
            official: false
        }
    ],
    "3-14": [
        {
            name: "International Day of Mathematics (Pi Day)",
            official: true
        },
        {
            name: "International Day of Action for Rivers",
            official: false
        },
        {
            name: "White Day",
            official: false
        }
    ],
    "3-15": [
        {
            name: "World Consumer Rights Day",
            official: true
        },
        {
            name: "International Day to Combat Islamophobia",
            official: true
        },
        {
            name: "World Speech Day",
            official: false
        }
    ],
    "3-16": [
        {
            name: "World Panda Day",
            official: false
        },
        {
            name: "National Freedom of Information Day",
            official: false
        }
    ],
    "3-17": [
        {
            name: "Saint Patrick's Day",
            official: false
        },
        {
            name: "World Recycling Day",
            official: false
        }
    ],
    "3-18": [
        {
            name: "Global Recycling Day",
            official: false
        },
        {
            name: "Supreme Sacrifice Day",
            official: false
        }
    ],
    "3-19": [
        {
            name: "World Social Work Day",
            official: false
        },
        {
            name: "International Read To Me Day",
            official: false
        }
    ],
    "3-20": [
        {
            name: "International Day of Happiness",
            official: true
        },
        {
            name: "French Language Day",
            official: true
        },
        {
            name: "World Frog Day",
            official: false
        },
        {
            name: "World Storytelling Day",
            official: false
        },
        {
            name: "World Sparrow Day",
            official: false
        }
    ],
    "3-21": [
        {
            name: "World Poetry Day",
            official: true
        },
        {
            name: "World Down Syndrome Day",
            official: true
        },
        {
            name: "International Day of Forests",
            official: true
        },
        {
            name: "International Nowruz Day",
            official: true
        },
        {
            name: "World Puppetry Day",
            official: false
        }
    ],
    "3-22": [
        {
            name: "World Water Day",
            official: true
        },
        {
            name: "International Seal Day",
            official: false
        }
    ],
    "3-23": [
        {
            name: "World Meteorological Day",
            official: true
        },
        {
            name: "World Puppy Day",
            official: false
        },
        {
            name: "Near Miss Day",
            official: false
        }
    ],
    "3-24": [
        {
            name: "World Tuberculosis Day",
            official: true
        },
        {
            name: "National Chocolate Covered Raisins Day",
            official: false
        }
    ],
    "3-25": [
        {
            name: "International Waffle Day",
            official: false
        },
        {
            name: "Tolkien Reading Day",
            official: false
        }
    ],
    "3-26": [
        {
            name: "World Spinach Day",
            official: false
        },
        {
            name: "Purple Day for Epilepsy",
            official: false
        },
        {
            name: "Make Up Your Own Holiday Day",
            official: false
        }
    ],
    "3-27": [
        {
            name: "World Theatre Day",
            official: true
        },
        {
            name: "International Whisk(e)y Day",
            official: false
        }
    ],
    "3-28": [
        {
            name: "World Piano Day",
            official: false
        },
        {
            name: "Something On a Stick Day",
            official: false
        }
    ],
    "3-29": [
        {
            name: "World Lemon Chiffon Pie Day",
            official: false
        },
        {
            name: "National Mom and Pop Business Owners Day",
            official: false
        }
    ],
    "3-30": [
        {
            name: "International Day of Zero Waste",
            official: true
        },
        {
            name: "World Bipolar Day",
            official: false
        },
        {
            name: "World Idli Day",
            official: false
        }
    ],
    "3-31": [
        {
            name: "World Backup Day",
            official: false
        },
        {
            name: "Crayon Day",
            official: false
        }
    ],
    "4-1": [
        {
            name: "April Fools' Day",
            official: false
        },
        {
            name: "International Fun at Work Day",
            official: false
        },
        {
            name: "Edible Book Day",
            official: false
        }
    ],
    "4-2": [
        {
            name: "World Autism Awareness Day",
            official: true
        },
        {
            name: "International Children's Book Day",
            official: false
        },
        {
            name: "National Peanut Butter and Jelly Day",
            official: false
        }
    ],
    "4-3": [
        {
            name: "World Party Day",
            official: false
        },
        {
            name: "World Aquatic Animals Day",
            official: false
        },
        {
            name: "Find a Rainbow Day",
            official: false
        }
    ],
    "4-4": [
        {
            name: "World Stray Animals Day",
            official: false
        },
        {
            name: "World Carrot Day",
            official: false
        },
        {
            name: "International Rat Day",
            official: false
        }
    ],
    "4-5": [
        {
            name: "International Day of Conscience",
            official: true
        },
        {
            name: "World Soup Day",
            official: false
        },
        {
            name: "Read a Road Map Day",
            official: false
        }
    ],
    "4-6": [
        {
            name: "International Day of Sport for Development and Peace",
            official: true
        },
        {
            name: "World Table Tennis Day",
            official: false
        },
        {
            name: "Carbonara Day",
            official: false
        }
    ],
    "4-7": [
        {
            name: "World Health Day",
            official: true
        },
        {
            name: "International Beaver Day",
            official: false
        },
        {
            name: "No Housework Day",
            official: false
        }
    ],
    "4-8": [
        {
            name: "World Romani Day",
            official: false
        },
        {
            name: "Zoo Lovers Day",
            official: false
        },
        {
            name: "Draw a Picture of a Bird Day",
            official: false
        }
    ],
    "4-9": [
        {
            name: "World ASMR Day",
            official: false
        },
        {
            name: "International Name Yourself Day",
            official: false
        },
        {
            name: "Unicorn Day",
            official: false
        }
    ],
    "4-10": [
        {
            name: "World Homeopathy Day",
            official: false
        },
        {
            name: "International Siblings Day",
            official: false
        },
        {
            name: "Safety Pin Day",
            official: false
        }
    ],
    "4-11": [
        {
            name: "World Parkinson's Day",
            official: true
        },
        {
            name: "National Pet Day",
            official: false
        },
        {
            name: "Submarine Day",
            official: false
        }
    ],
    "4-12": [
        {
            name: "International Day of Human Space Flight",
            official: true
        },
        {
            name: "World Hamster Day",
            official: false
        },
        {
            name: "Grilled Cheese Sandwich Day",
            official: false
        }
    ],
    "4-13": [
        {
            name: "International Scrabble Day",
            official: false
        },
        {
            name: "World Plant Appreciation Day",
            official: false
        }
    ],
    "4-14": [
        {
            name: "World Chagas Disease Day",
            official: true
        },
        {
            name: "World Quantum Day",
            official: false
        },
        {
            name: "International Moment of Laughter Day",
            official: false
        }
    ],
    "4-15": [
        {
            name: "World Art Day",
            official: true
        },
        {
            name: "World Anime Day",
            official: false
        },
        {
            name: "Microvolunteering Day",
            official: false
        }
    ],
    "4-16": [
        {
            name: "World Voice Day",
            official: false
        },
        {
            name: "National Elephant Day",
            official: false
        },
        {
            name: "Save the Elephant Day",
            official: false
        }
    ],
    "4-17": [
        {
            name: "World Hemophilia Day",
            official: true
        },
        {
            name: "World Circus Day",
            official: false
        },
        {
            name: "International Haiku Poetry Day",
            official: false
        }
    ],
    "4-18": [
        {
            name: "World Heritage Day (Monuments and Sites)",
            official: true
        },
        {
            name: "World Amateur Radio Day",
            official: false
        },
        {
            name: "International Pizza Cake Day",
            official: false
        }
    ],
    "4-19": [
        {
            name: "World Liver Day",
            official: false
        },
        {
            name: "Garlic Day",
            official: false
        },
        {
            name: "Bicycle Day",
            official: false
        }
    ],
    "4-20": [
        {
            name: "Chinese Language Day",
            official: true
        },
        {
            name: "World Cold-Brew Day",
            official: false
        },
        {
            name: "Look Alike Day",
            official: false
        }
    ],
    "4-21": [
        {
            name: "World Creativity and Innovation Day",
            official: true
        },
        {
            name: "World Fish Migration Day",
            official: false
        },
        {
            name: "World Tea Day (UK)",
            official: false
        }
    ],
    "4-22": [
        {
            name: "Earth Day (International Mother Earth Day)",
            official: true
        },
        {
            name: "World Jelly Bean Day",
            official: false
        }
    ],
    "4-23": [
        {
            name: "World Book and Copyright Day",
            official: true
        },
        {
            name: "English Language Day",
            official: true
        },
        {
            name: "Spanish Language Day",
            official: true
        },
        {
            name: "World Table Tennis Day",
            official: false
        }
    ],
    "4-24": [
        {
            name: "World Tapir Day",
            official: false
        },
        {
            name: "International Stationery Week",
            official: false
        }
    ],
    "4-25": [
        {
            name: "World Malaria Day",
            official: true
        },
        {
            name: "International Girls in ICT Day",
            official: true
        },
        {
            name: "World Penguin Day",
            official: false
        },
        {
            name: "World DNA Day",
            official: false
        }
    ],
    "4-26": [
        {
            name: "World Intellectual Property Day",
            official: true
        },
        {
            name: "World Pilot Day",
            official: false
        },
        {
            name: "International Guide Dog Day",
            official: false
        }
    ],
    "4-27": [
        {
            name: "World Graphic Design Day",
            official: false
        },
        {
            name: "World Tapir Day",
            official: false
        },
        {
            name: "Morse Code Day",
            official: false
        }
    ],
    "4-28": [
        {
            name: "World Day for Safety and Health at Work",
            official: true
        },
        {
            name: "Biological Clock Day",
            official: false
        },
        {
            name: "National Superhero Day",
            official: false
        }
    ],
    "4-29": [
        {
            name: "International Dance Day",
            official: true
        },
        {
            name: "World Wish Day",
            official: false
        },
        {
            name: "International Celestial Day",
            official: false
        }
    ],
    "4-30": [
        {
            name: "International Jazz Day",
            official: true
        },
        {
            name: "Honesty Day",
            official: false
        },
        {
            name: "Boba Day",
            official: false
        }
    ],
    "5-1": [
        {
            name: "International Workers' Day (May Day)",
            official: true
        },
        {
            name: "World Laughter Day",
            official: false
        },
        {
            name: "Global Love Day",
            official: false
        }
    ],
    "5-2": [
        {
            name: "World Tuna Day",
            official: true
        },
        {
            name: "World Astronomy Day",
            official: false
        },
        {
            name: "Harry Potter Day",
            official: false
        }
    ],
    "5-3": [
        {
            name: "World Press Freedom Day",
            official: true
        },
        {
            name: "World Wild Koala Day",
            official: false
        },
        {
            name: "National Paranormal Day",
            official: false
        }
    ],
    "5-4": [
        {
            name: "Star Wars Day (May the 4th)",
            official: false
        },
        {
            name: "International Firefighters' Day",
            official: false
        },
        {
            name: "World Give Day",
            official: false
        }
    ],
    "5-5": [
        {
            name: "World Hand Hygiene Day",
            official: true
        },
        {
            name: "African World Heritage Day",
            official: true
        },
        {
            name: "Cinco de Mayo",
            official: false
        },
        {
            name: "World Portuguese Language Day",
            official: true
        }
    ],
    "5-6": [
        {
            name: "International No Diet Day",
            official: false
        },
        {
            name: "World Beverage Day",
            official: false
        }
    ],
    "5-7": [
        {
            name: "World Asthma Day",
            official: true
        },
        {
            name: "World Athletics Day",
            official: false
        }
    ],
    "5-8": [
        {
            name: "World Red Cross and Red Crescent Day",
            official: true
        },
        {
            name: "World Donkey Day",
            official: false
        },
        {
            name: "World Ovarian Cancer Day",
            official: false
        }
    ],
    "5-9": [
        {
            name: "Europe Day",
            official: true
        },
        {
            name: "World Moscato Day",
            official: false
        }
    ],
    "5-10": [
        {
            name: "International Day of Argania",
            official: true
        },
        {
            name: "World Lupus Day",
            official: false
        },
        {
            name: "Clean Your Room Day",
            official: false
        }
    ],
    "5-11": [
        {
            name: "World Origami Day",
            official: false
        },
        {
            name: "World Ego Day",
            official: false
        },
        {
            name: "Eat What You Want Day",
            official: false
        }
    ],
    "5-12": [
        {
            name: "International Day of Plant Health",
            official: true
        },
        {
            name: "International Nurses Day",
            official: true
        },
        {
            name: "World Fibromyalgia Day",
            official: false
        }
    ],
    "5-13": [
        {
            name: "World Cocktail Day",
            official: false
        },
        {
            name: "World Hummus Day",
            official: false
        },
        {
            name: "International Top Dog Day",
            official: false
        }
    ],
    "5-14": [
        {
            name: "World Fair Trade Day",
            official: false
        },
        {
            name: "International Chicken Dance Day",
            official: false
        }
    ],
    "5-15": [
        {
            name: "International Day of Families",
            official: true
        },
        {
            name: "World Straw Hat Day",
            official: false
        },
        {
            name: "International Chocolate Chip Day",
            official: false
        }
    ],
    "5-16": [
        {
            name: "International Day of Light",
            official: true
        },
        {
            name: "International Day of Living Together in Peace",
            official: true
        },
        {
            name: "National Sea Monkey Day",
            official: false
        }
    ],
    "5-17": [
        {
            name: "World Telecommunication and Information Society Day",
            official: true
        },
        {
            name: "World Hypertension Day",
            official: false
        },
        {
            name: "World Baking Day",
            official: false
        }
    ],
    "5-18": [
        {
            name: "International Museum Day",
            official: true
        },
        {
            name: "World Vaccine Day",
            official: false
        }
    ],
    "5-19": [
        {
            name: "World Plant Milk Day",
            official: false
        },
        {
            name: "World IBD Day",
            official: false
        }
    ],
    "5-20": [
        {
            name: "World Bee Day",
            official: true
        },
        {
            name: "World Metrology Day",
            official: false
        },
        {
            name: "International Red Panda Day",
            official: false
        }
    ],
    "5-21": [
        {
            name: "International Tea Day",
            official: true
        },
        {
            name: "World Day for Cultural Diversity",
            official: true
        },
        {
            name: "World Fish Migration Day",
            official: false
        }
    ],
    "5-22": [
        {
            name: "International Day for Biological Diversity",
            official: true
        },
        {
            name: "World Goth Day",
            official: false
        },
        {
            name: "World Sherlock Holmes Day",
            official: false
        }
    ],
    "5-23": [
        {
            name: "World Turtle Day",
            official: false
        },
        {
            name: "International Day to End Obstetric Fistula",
            official: true
        }
    ],
    "5-24": [
        {
            name: "World Tiara Day",
            official: false
        },
        {
            name: "International Scampi Day",
            official: false
        }
    ],
    "5-25": [
        {
            name: "World Towel Day",
            official: false
        },
        {
            name: "Africa Day",
            official: true
        },
        {
            name: "World Geek Pride Day",
            official: false
        },
        {
            name: "International Missing Children's Day",
            official: true
        }
    ],
    "5-26": [
        {
            name: "World Lindy Hop Day",
            official: false
        },
        {
            name: "World Red Dracula Day",
            official: false
        }
    ],
    "5-27": [
        {
            name: "World Otter Day",
            official: false
        },
        {
            name: "Sun Screen Day",
            official: false
        }
    ],
    "5-28": [
        {
            name: "World Hunger Day",
            official: false
        },
        {
            name: "Menstrual Hygiene Day",
            official: true
        },
        {
            name: "International Hamburger Day",
            official: false
        }
    ],
    "5-29": [
        {
            name: "International Day of UN Peacekeepers",
            official: true
        },
        {
            name: "World Digestive Health Day",
            official: false
        },
        {
            name: "International Mount Everest Day",
            official: false
        }
    ],
    "5-30": [
        {
            name: "World Multiple Sclerosis Day",
            official: false
        },
        {
            name: "National Potato Day",
            official: false
        }
    ],
    "5-31": [
        {
            name: "World No Tobacco Day",
            official: true
        },
        {
            name: "World Parrot Day",
            official: false
        },
        {
            name: "Web Designer Day",
            official: false
        }
    ],
    "6-1": [
        {
            name: "Global Day of Parents",
            official: true
        },
        {
            name: "World Milk Day",
            official: true
        },
        {
            name: "World Reef Day",
            official: false
        },
        {
            name: "Dinosaur Day",
            official: false
        }
    ],
    "6-2": [
        {
            name: "World Eating Disorders Action Day",
            official: false
        },
        {
            name: "International Sex Workers Day",
            official: false
        }
    ],
    "6-3": [
        {
            name: "World Bicycle Day",
            official: true
        },
        {
            name: "World Cider Day",
            official: false
        }
    ],
    "6-4": [
        {
            name: "World Running Day",
            official: false
        },
        {
            name: "International Day of Innocent Children Victims of Aggression",
            official: true
        },
        {
            name: "National Cheese Day",
            official: false
        }
    ],
    "6-5": [
        {
            name: "World Environment Day",
            official: true
        },
        {
            name: "International Day for the Fight Against Illegal Fishing",
            official: true
        },
        {
            name: "World Donut Day",
            official: false
        }
    ],
    "6-6": [
        {
            name: "Russian Language Day",
            official: true
        },
        {
            name: "World Pest Day",
            official: false
        },
        {
            name: "World Yo-Yo Day",
            official: false
        }
    ],
    "6-7": [
        {
            name: "World Food Safety Day",
            official: true
        },
        {
            name: "International Tourette Syndrome Awareness Day",
            official: false
        }
    ],
    "6-8": [
        {
            name: "World Oceans Day",
            official: true
        },
        {
            name: "World Brain Tumor Day",
            official: false
        },
        {
            name: "Best Friends Day",
            official: false
        }
    ],
    "6-9": [
        {
            name: "World Accreditation Day",
            official: false
        },
        {
            name: "International Coral Reef Day",
            official: false
        },
        {
            name: "Donald Duck Day",
            official: false
        }
    ],
    "6-10": [
        {
            name: "World Art Nouveau Day",
            official: false
        },
        {
            name: "International Ice Cream Day",
            official: false
        }
    ],
    "6-11": [
        {
            name: "International Day of Play",
            official: true
        },
        {
            name: "World Jaguar Day",
            official: false
        }
    ],
    "6-12": [
        {
            name: "World Falafel Day",
            official: false
        },
        {
            name: "International Red Hand Day",
            official: false
        }
    ],
    "6-13": [
        {
            name: "International Albinism Awareness Day",
            official: true
        },
        {
            name: "World Softball Day",
            official: false
        }
    ],
    "6-14": [
        {
            name: "World Blood Donor Day",
            official: true
        },
        {
            name: "International Bourbon Day",
            official: false
        }
    ],
    "6-15": [
        {
            name: "Global Wind Day",
            official: false
        },
        {
            name: "World Elder Abuse Awareness Day",
            official: true
        },
        {
            name: "Nature Photography Day",
            official: false
        }
    ],
    "6-16": [
        {
            name: "International Day of Family Remittances",
            official: true
        },
        {
            name: "World Sea Turtle Day",
            official: false
        },
        {
            name: "Bloomsday",
            official: false
        }
    ],
    "6-17": [
        {
            name: "World Day to Combat Desertification and Drought",
            official: true
        },
        {
            name: "World Crocodile Day",
            official: false
        }
    ],
    "6-18": [
        {
            name: "Sustainable Gastronomy Day",
            official: true
        },
        {
            name: "World Picnic Day",
            official: false
        },
        {
            name: "International Sushi Day",
            official: false
        }
    ],
    "6-19": [
        {
            name: "World Sickle Cell Day",
            official: true
        },
        {
            name: "World Sauntering Day",
            official: false
        },
        {
            name: "World Martini Day",
            official: false
        }
    ],
    "6-20": [
        {
            name: "World Refugee Day",
            official: true
        },
        {
            name: "World Wi-Fi Day",
            official: false
        },
        {
            name: "World Productivity Day",
            official: false
        }
    ],
    "6-21": [
        {
            name: "International Day of Yoga",
            official: true
        },
        {
            name: "World Music Day (Fête de la Musique)",
            official: true
        },
        {
            name: "World Hydrography Day",
            official: true
        },
        {
            name: "World Giraffe Day",
            official: false
        },
        {
            name: "International Skateboarding Day",
            official: false
        }
    ],
    "6-22": [
        {
            name: "World Rainforest Day",
            official: false
        },
        {
            name: "World Camel Day",
            official: false
        }
    ],
    "6-23": [
        {
            name: "United Nations Public Service Day",
            official: true
        },
        {
            name: "International Olympic Day",
            official: true
        },
        {
            name: "International Women in Engineering Day",
            official: false
        }
    ],
    "6-24": [
        {
            name: "International Day of Women in Diplomacy",
            official: true
        },
        {
            name: "World Fairy Day",
            official: false
        }
    ],
    "6-25": [
        {
            name: "Day of the Seafarer",
            official: true
        },
        {
            name: "World Vitiligo Day",
            official: false
        },
        {
            name: "Global Beatles Day",
            official: false
        }
    ],
    "6-26": [
        {
            name: "World Refrigeration Day",
            official: false
        },
        {
            name: "International Day Against Drug Abuse",
            official: true
        },
        {
            name: "National Canoe Day",
            official: false
        }
    ],
    "6-27": [
        {
            name: "Micro-, Small and Medium-sized Enterprises Day",
            official: true
        },
        {
            name: "National Sunglasses Day",
            official: false
        }
    ],
    "6-28": [
        {
            name: "International Caps Lock Day",
            official: false
        },
        {
            name: "Tau Day",
            official: false
        }
    ],
    "6-29": [
        {
            name: "International Day of the Tropics",
            official: true
        },
        {
            name: "World Camera Day",
            official: false
        },
        {
            name: "World Industrial Design Day",
            official: false
        }
    ],
    "6-30": [
        {
            name: "International Asteroid Day",
            official: true
        },
        {
            name: "International Day of Parliamentarism",
            official: true
        },
        {
            name: "World Social Media Day",
            official: false
        }
    ],
    "7-1": [
        {
            name: "International Joke Day",
            official: false
        },
        {
            name: "World Reggae Day",
            official: false
        },
        {
            name: "International Fruit Day",
            official: false
        }
    ],
    "7-2": [
        {
            name: "World UFO Day",
            official: false
        },
        {
            name: "World Sports Journalists Day",
            official: false
        }
    ],
    "7-3": [
        {
            name: "International Plastic Bag Free Day",
            official: false
        },
        {
            name: "World Disobedience Day",
            official: false
        }
    ],
    "7-4": [
        {
            name: "World Alice in Wonderland Day",
            official: false
        },
        {
            name: "National Jackfruit Day",
            official: false
        }
    ],
    "7-5": [
        {
            name: "World Badminton Day",
            official: false
        },
        {
            name: "Bikini Day",
            official: false
        }
    ],
    "7-6": [
        {
            name: "World Zoonoses Day",
            official: true
        },
        {
            name: "International Kissing Day",
            official: false
        }
    ],
    "7-7": [
        {
            name: "World Kiswahili Language Day",
            official: true
        },
        {
            name: "World Chocolate Day",
            official: false
        },
        {
            name: "Global Forgiveness Day",
            official: false
        }
    ],
    "7-8": [
        {
            name: "World Allergy Day",
            official: false
        },
        {
            name: "Video Games Day",
            official: false
        }
    ],
    "7-9": [
        {
            name: "World Kebab Day",
            official: false
        },
        {
            name: "International Fashion Day",
            official: false
        }
    ],
    "7-10": [
        {
            name: "World Capybara Day",
            official: false
        },
        {
            name: "Nikola Tesla Day",
            official: false
        },
        {
            name: "International Town Criers Day",
            official: false
        }
    ],
    "7-11": [
        {
            name: "World Population Day",
            official: true
        },
        {
            name: "Cheering Up the Lonely Day",
            official: false
        }
    ],
    "7-12": [
        {
            name: "Malala Day",
            official: true
        },
        {
            name: "International Day of Combatting Sand and Dust Storms",
            official: true
        },
        {
            name: "Paper Bag Day",
            official: false
        }
    ],
    "7-13": [
        {
            name: "International Rock Day",
            official: false
        },
        {
            name: "World French Fries Day",
            official: false
        }
    ],
    "7-14": [
        {
            name: "World Chimpanzee Day",
            official: false
        },
        {
            name: "Shark Awareness Day",
            official: false
        },
        {
            name: "International Nude Day",
            official: false
        }
    ],
    "7-15": [
        {
            name: "World Youth Skills Day",
            official: true
        },
        {
            name: "National Give Something Away Day",
            official: false
        }
    ],
    "7-16": [
        {
            name: "World Snake Day",
            official: false
        },
        {
            name: "AI Appreciation Day",
            official: false
        }
    ],
    "7-17": [
        {
            name: "World Day for International Justice",
            official: true
        },
        {
            name: "World Emoji Day",
            official: false
        },
        {
            name: "International Firgun Day",
            official: false
        }
    ],
    "7-18": [
        {
            name: "Nelson Mandela International Day",
            official: true
        },
        {
            name: "World Listening Day",
            official: false
        }
    ],
    "7-19": [
        {
            name: "World Ice Cream Day",
            official: false
        },
        {
            name: "International Retainer Day",
            official: false
        }
    ],
    "7-20": [
        {
            name: "World Chess Day",
            official: true
        },
        {
            name: "International Moon Day",
            official: true
        },
        {
            name: "Space Exploration Day",
            official: false
        }
    ],
    "7-21": [
        {
            name: "World Junk Food Day",
            official: false
        },
        {
            name: "National Gazpacho Day",
            official: false
        }
    ],
    "7-22": [
        {
            name: "World Brain Day",
            official: false
        },
        {
            name: "Pi Approximation Day",
            official: false
        },
        {
            name: "Hammock Day",
            official: false
        }
    ],
    "7-23": [
        {
            name: "World Yoyo Day",
            official: false
        },
        {
            name: "International Yada Yada Day",
            official: false
        }
    ],
    "7-24": [
        {
            name: "International Self-Care Day",
            official: false
        },
        {
            name: "World Drive-Thru Day",
            official: false
        },
        {
            name: "Cousins Day",
            official: false
        }
    ],
    "7-25": [
        {
            name: "World Drowning Prevention Day",
            official: true
        },
        {
            name: "International Red Shoe Day",
            official: false
        }
    ],
    "7-26": [
        {
            name: "International Day for Conservation of Mangrove Ecosystem",
            official: true
        },
        {
            name: "World Tofu Day",
            official: false
        }
    ],
    "7-27": [
        {
            name: "World Head and Neck Cancer Day",
            official: false
        },
        {
            name: "Take Your Houseplant for a Walk Day",
            official: false
        }
    ],
    "7-28": [
        {
            name: "World Hepatitis Day",
            official: true
        },
        {
            name: "World Nature Conservation Day",
            official: false
        }
    ],
    "7-29": [
        {
            name: "International Tiger Day",
            official: true
        },
        {
            name: "World Lasagna Day",
            official: false
        }
    ],
    "7-30": [
        {
            name: "International Day of Friendship",
            official: true
        },
        {
            name: "World Snorkeling Day",
            official: false
        },
        {
            name: "World Cheesecake Day",
            official: false
        }
    ],
    "7-31": [
        {
            name: "World Ranger Day",
            official: false
        },
        {
            name: "World Avocado Day",
            official: false
        }
    ],
    "8-1": [
        {
            name: "World Wide Web Day",
            official: false
        },
        {
            name: "World Scout Scarf Day",
            official: false
        },
        {
            name: "International Beer Day",
            official: false
        }
    ],
    "8-2": [
        {
            name: "World Ice Cream Sandwich Day",
            official: false
        },
        {
            name: "International Coloring Book Day",
            official: false
        }
    ],
    "8-3": [
        {
            name: "World Watermelon Day",
            official: false
        },
        {
            name: "Cloves Day",
            official: false
        }
    ],
    "8-4": [
        {
            name: "International Owl Awareness Day",
            official: false
        },
        {
            name: "Single Working Women's Day",
            official: false
        }
    ],
    "8-5": [
        {
            name: "World Traffic Light Day",
            official: false
        },
        {
            name: "Work Like a Dog Day",
            official: false
        }
    ],
    "8-6": [
        {
            name: "World Fresh Breath Day",
            official: false
        },
        {
            name: "Farm Worker Appreciation Day",
            official: false
        }
    ],
    "8-7": [
        {
            name: "International Beer Day",
            official: false
        },
        {
            name: "Professional Speakers Day",
            official: false
        }
    ],
    "8-8": [
        {
            name: "International Cat Day",
            official: false
        },
        {
            name: "World Infinity Day",
            official: false
        }
    ],
    "8-9": [
        {
            name: "International Day of Indigenous Peoples",
            official: true
        },
        {
            name: "World Book Lovers Day",
            official: false
        }
    ],
    "8-10": [
        {
            name: "World Lion Day",
            official: false
        },
        {
            name: "World Biofuel Day",
            official: false
        },
        {
            name: "International Lazy Day",
            official: false
        }
    ],
    "8-11": [
        {
            name: "World Steelpan Day",
            official: true
        },
        {
            name: "National Sons and Daughters Day",
            official: false
        }
    ],
    "8-12": [
        {
            name: "International Youth Day",
            official: true
        },
        {
            name: "World Elephant Day",
            official: false
        },
        {
            name: "Vinyl Record Day",
            official: false
        }
    ],
    "8-13": [
        {
            name: "International Left-Handers Day",
            official: false
        },
        {
            name: "World Prosecco Day",
            official: false
        }
    ],
    "8-14": [
        {
            name: "World Lizard Day",
            official: false
        },
        {
            name: "World Calligraphy Day",
            official: false
        }
    ],
    "8-15": [
        {
            name: "World Honey Bee Day",
            official: false
        },
        {
            name: "National Relaxation Day",
            official: false
        }
    ],
    "8-16": [
        {
            name: "World Roller Coaster Day",
            official: false
        },
        {
            name: "World Rum Day",
            official: false
        }
    ],
    "8-17": [
        {
            name: "World Black Cat Day",
            official: false
        },
        {
            name: "National Thrift Shop Day",
            official: false
        }
    ],
    "8-18": [
        {
            name: "World Helium Day",
            official: false
        },
        {
            name: "Bad Poetry Day",
            official: false
        }
    ],
    "8-19": [
        {
            name: "World Humanitarian Day",
            official: true
        },
        {
            name: "World Photography Day",
            official: false
        },
        {
            name: "World Orangutan Day",
            official: false
        }
    ],
    "8-20": [
        {
            name: "World Mosquito Day",
            official: false
        },
        {
            name: "World Honey Bee Day",
            official: false
        }
    ],
    "8-21": [
        {
            name: "World Senior Citizen Day",
            official: false
        },
        {
            name: "Poet's Day",
            official: false
        }
    ],
    "8-22": [
        {
            name: "World Plant Milk Day",
            official: false
        },
        {
            name: "Be An Angel Day",
            official: false
        }
    ],
    "8-23": [
        {
            name: "International Find-a-Money-Making-Idea Day",
            official: false
        },
        {
            name: "Ride the Wind Day",
            official: false
        }
    ],
    "8-24": [
        {
            name: "International Strange Music Day",
            official: false
        },
        {
            name: "Pluto Demoted Day",
            official: false
        }
    ],
    "8-25": [
        {
            name: "World Ramen Day",
            official: false
        },
        {
            name: "Kiss and Make Up Day",
            official: false
        }
    ],
    "8-26": [
        {
            name: "International Dog Day",
            official: false
        },
        {
            name: "Women's Equality Day",
            official: false
        }
    ],
    "8-27": [
        {
            name: "World Rock Paper Scissors Day",
            official: false
        },
        {
            name: "Just Because Day",
            official: false
        }
    ],
    "8-28": [
        {
            name: "World Read a Book Day",
            official: false
        },
        {
            name: "International Bow Tie Day",
            official: false
        }
    ],
    "8-29": [
        {
            name: "International Day against Nuclear Tests",
            official: true
        },
        {
            name: "Individual Rights Day",
            official: false
        }
    ],
    "8-30": [
        {
            name: "International Day for People of African Descent",
            official: true
        },
        {
            name: "World Whale Shark Day",
            official: false
        },
        {
            name: "Frankenstein Day",
            official: false
        }
    ],
    "8-31": [
        {
            name: "International Overdose Awareness Day",
            official: false
        },
        {
            name: "World Distance Learning Day",
            official: false
        },
        {
            name: "Eat Outside Day",
            official: false
        }
    ],
    "9-1": [
        {
            name: "World Letter Writing Day",
            official: false
        },
        {
            name: "International Primatological Society Day",
            official: false
        }
    ],
    "9-2": [
        {
            name: "World Coconut Day",
            official: false
        },
        {
            name: "International Bacon Day",
            official: false
        }
    ],
    "9-3": [
        {
            name: "World Skyscraper Day",
            official: false
        },
        {
            name: "International Bacon Day",
            official: false
        }
    ],
    "9-4": [
        {
            name: "World Taekwondo Day",
            official: false
        },
        {
            name: "World Sexual Health Day",
            official: false
        }
    ],
    "9-5": [
        {
            name: "International Day of Charity",
            official: true
        },
        {
            name: "World Samosa Day",
            official: false
        }
    ],
    "9-6": [
        {
            name: "Global Read a Book Day",
            official: false
        },
        {
            name: "Fight Procrastination Day",
            official: false
        }
    ],
    "9-7": [
        {
            name: "International Day of Clean Air for Blue Skies",
            official: true
        },
        {
            name: "World Salami Day",
            official: false
        }
    ],
    "9-8": [
        {
            name: "International Literacy Day",
            official: true
        },
        {
            name: "World Physical Therapy Day",
            official: false
        }
    ],
    "9-9": [
        {
            name: "International Day to Protect Education from Attack",
            official: true
        },
        {
            name: "World EV Day",
            official: false
        },
        {
            name: "Teddy Bear Day",
            official: false
        }
    ],
    "9-10": [
        {
            name: "World First Aid Day",
            official: false
        },
        {
            name: "World Suicide Prevention Day",
            official: true
        }
    ],
    "9-11": [
        {
            name: "Patriot Day",
            official: false
        },
        {
            name: "Make Your Bed Day",
            official: false
        }
    ],
    "9-12": [
        {
            name: "United Nations Day for South-South Cooperation",
            official: true
        },
        {
            name: "World Video Games Day",
            official: false
        }
    ],
    "9-13": [
        {
            name: "International Programmers' Day",
            official: false
        },
        {
            name: "World Chocolate Day",
            official: false
        },
        {
            name: "Roald Dahl Day",
            official: false
        }
    ],
    "9-14": [
        {
            name: "World Field Epidemiology Day",
            official: false
        },
        {
            name: "National Cream Filled Donut Day",
            official: false
        }
    ],
    "9-15": [
        {
            name: "International Day of Democracy",
            official: true
        },
        {
            name: "World Lymphoma Awareness Day",
            official: false
        },
        {
            name: "Greenpower Day",
            official: false
        }
    ],
    "9-16": [
        {
            name: "International Day for Preservation of Ozone Layer",
            official: true
        },
        {
            name: "World Cleanup Day",
            official: true
        },
        {
            name: "Collect Rocks Day",
            official: false
        }
    ],
    "9-17": [
        {
            name: "World Patient Safety Day",
            official: true
        },
        {
            name: "International Country Music Day",
            official: false
        }
    ],
    "9-18": [
        {
            name: "International Equal Pay Day",
            official: true
        },
        {
            name: "World Bamboo Day",
            official: false
        },
        {
            name: "World Water Monitoring Day",
            official: false
        }
    ],
    "9-19": [
        {
            name: "Talk Like a Pirate Day",
            official: false
        },
        {
            name: "International Gymnastics Day",
            official: false
        }
    ],
    "9-20": [
        {
            name: "World Rice Day",
            official: false
        },
        {
            name: "World Paella Day",
            official: false
        }
    ],
    "9-21": [
        {
            name: "International Day of Peace",
            official: true
        },
        {
            name: "World Alzheimer's Day",
            official: true
        },
        {
            name: "World Gratitude Day",
            official: false
        }
    ],
    "9-22": [
        {
            name: "World Rhino Day",
            official: false
        },
        {
            name: "World Car-Free Day",
            official: false
        },
        {
            name: "Hobbit Day",
            official: false
        }
    ],
    "9-23": [
        {
            name: "International Day of Sign Languages",
            official: true
        },
        {
            name: "Celebrate Bisexuality Day",
            official: false
        }
    ],
    "9-24": [
        {
            name: "World Gorilla Day",
            official: false
        },
        {
            name: "National Punctuation Day",
            official: false
        }
    ],
    "9-25": [
        {
            name: "World Pharmacists Day",
            official: false
        },
        {
            name: "World Dream Day",
            official: false
        },
        {
            name: "Comic Book Day",
            official: false
        }
    ],
    "9-26": [
        {
            name: "World Environmental Health Day",
            official: false
        },
        {
            name: "European Day of Languages",
            official: true
        }
    ],
    "9-27": [
        {
            name: "World Tourism Day",
            official: true
        },
        {
            name: "World Cornflower Day",
            official: false
        }
    ],
    "9-28": [
        {
            name: "World Rabies Day",
            official: true
        },
        {
            name: "International Day for Universal Access to Information",
            official: true
        },
        {
            name: "Ask a Stupid Question Day",
            official: false
        }
    ],
    "9-29": [
        {
            name: "World Heart Day",
            official: true
        },
        {
            name: "International Day of Awareness of Food Loss and Waste",
            official: true
        }
    ],
    "9-30": [
        {
            name: "International Translation Day",
            official: true
        },
        {
            name: "World Maritime Day",
            official: true
        },
        {
            name: "International Podcast Day",
            official: false
        }
    ],
    "10-1": [
        {
            name: "International Day of Older Persons",
            official: true
        },
        {
            name: "International Coffee Day",
            official: false
        },
        {
            name: "World Vegetarian Day",
            official: false
        },
        {
            name: "World Music Day",
            official: false
        }
    ],
    "10-2": [
        {
            name: "International Day of Non-Violence",
            official: true
        },
        {
            name: "World Farm Animals Day",
            official: false
        },
        {
            name: "World Table Tennis Day",
            official: false
        }
    ],
    "10-3": [
        {
            name: "World Habitat Day",
            official: true
        },
        {
            name: "World Temperance Day",
            official: false
        },
        {
            name: "National Techies Day",
            official: false
        }
    ],
    "10-4": [
        {
            name: "World Animal Day",
            official: true
        },
        {
            name: "World Space Week Begins",
            official: true
        },
        {
            name: "National Taco Day",
            official: false
        }
    ],
    "10-5": [
        {
            name: "World Teachers' Day",
            official: true
        },
        {
            name: "Global James Bond Day",
            official: false
        }
    ],
    "10-6": [
        {
            name: "World Smile Day",
            official: false
        },
        {
            name: "Mad Hatter Day",
            official: false
        }
    ],
    "10-7": [
        {
            name: "World Cotton Day",
            official: true
        },
        {
            name: "World Habitat Day",
            official: false
        }
    ],
    "10-8": [
        {
            name: "World Octopus Day",
            official: false
        },
        {
            name: "World Migratory Bird Day",
            official: false
        }
    ],
    "10-9": [
        {
            name: "World Post Day",
            official: true
        },
        {
            name: "Curious Events Day",
            official: false
        }
    ],
    "10-10": [
        {
            name: "World Mental Health Day",
            official: true
        },
        {
            name: "World Porridge Day",
            official: false
        },
        {
            name: "World Homeless Day",
            official: false
        }
    ],
    "10-11": [
        {
            name: "International Day of the Girl Child",
            official: true
        },
        {
            name: "World Origami Day",
            official: false
        }
    ],
    "10-12": [
        {
            name: "World Arthritis Day",
            official: false
        },
        {
            name: "World Farmers Day",
            official: false
        }
    ],
    "10-13": [
        {
            name: "International Day for Disaster Risk Reduction",
            official: true
        },
        {
            name: "World Sight Day",
            official: false
        },
        {
            name: "International Suit Up Day",
            official: false
        }
    ],
    "10-14": [
        {
            name: "World Standards Day",
            official: true
        },
        {
            name: "World Sight Day",
            official: true
        },
        {
            name: "National Dessert Day",
            official: false
        }
    ],
    "10-15": [
        {
            name: "International Day of Rural Women",
            official: true
        },
        {
            name: "Global Handwashing Day",
            official: true
        },
        {
            name: "White Cane Safety Day",
            official: false
        }
    ],
    "10-16": [
        {
            name: "World Food Day",
            official: true
        },
        {
            name: "World Anaesthesia Day",
            official: false
        },
        {
            name: "World Spine Day",
            official: false
        }
    ],
    "10-17": [
        {
            name: "International Day for Eradication of Poverty",
            official: true
        },
        {
            name: "World Trauma Day",
            official: false
        }
    ],
    "10-18": [
        {
            name: "World Menopause Day",
            official: false
        },
        {
            name: "World Vasectomy Day",
            official: false
        }
    ],
    "10-19": [
        {
            name: "International Gin and Tonic Day",
            official: false
        },
        {
            name: "Evaluate Your Life Day",
            official: false
        }
    ],
    "10-20": [
        {
            name: "World Statistics Day",
            official: true
        },
        {
            name: "World Osteoporosis Day",
            official: false
        },
        {
            name: "International Chef Day",
            official: false
        }
    ],
    "10-21": [
        {
            name: "World Reptile Day",
            official: false
        },
        {
            name: "Global Iodine Deficiency Disorders Prevention Day",
            official: false
        }
    ],
    "10-22": [
        {
            name: "International Stuttering Awareness Day",
            official: false
        },
        {
            name: "National Caps Lock Day",
            official: false
        }
    ],
    "10-23": [
        {
            name: "World Mole Day",
            official: false
        },
        {
            name: "World Snow Leopard Day",
            official: false
        },
        {
            name: "IPod Day",
            official: false
        }
    ],
    "10-24": [
        {
            name: "United Nations Day",
            official: true
        },
        {
            name: "World Development Information Day",
            official: true
        },
        {
            name: "World Polio Day",
            official: true
        },
        {
            name: "Global Media and Information Literacy Week",
            official: true
        }
    ],
    "10-25": [
        {
            name: "World Pasta Day",
            official: false
        },
        {
            name: "World Opera Day",
            official: false
        },
        {
            name: "International Artists Day",
            official: false
        }
    ],
    "10-26": [
        {
            name: "World Lemur Day",
            official: false
        },
        {
            name: "National Pumpkin Day",
            official: false
        }
    ],
    "10-27": [
        {
            name: "World Day for Audiovisual Heritage",
            official: true
        },
        {
            name: "World Occupational Therapy Day",
            official: false
        }
    ],
    "10-28": [
        {
            name: "International Animation Day",
            official: false
        },
        {
            name: "World Judo Day",
            official: false
        }
    ],
    "10-29": [
        {
            name: "World Stroke Day",
            official: true
        },
        {
            name: "World Internet Day",
            official: false
        },
        {
            name: "International Cat Day (US)",
            official: false
        }
    ],
    "10-30": [
        {
            name: "World Thrift Day",
            official: false
        },
        {
            name: "Checklist Day",
            official: false
        }
    ],
    "10-31": [
        {
            name: "World Cities Day",
            official: true
        },
        {
            name: "Halloween",
            official: false
        },
        {
            name: "Magic Day",
            official: false
        }
    ],
    "11-1": [
        {
            name: "World Vegan Day",
            official: false
        },
        {
            name: "International Author's Day",
            official: false
        }
    ],
    "11-2": [
        {
            name: "World Ballet Day",
            official: false
        },
        {
            name: "International Day to End Impunity for Crimes against Journalists",
            official: true
        }
    ],
    "11-3": [
        {
            name: "World Jellyfish Day",
            official: false
        },
        {
            name: "World Sandwich Day",
            official: false
        }
    ],
    "11-4": [
        {
            name: "World Candy Day",
            official: false
        },
        {
            name: "Use Your Common Sense Day",
            official: false
        }
    ],
    "11-5": [
        {
            name: "World Tsunami Awareness Day",
            official: true
        },
        {
            name: "World Romance Day",
            official: false
        }
    ],
    "11-6": [
        {
            name: "World Saxophone Day",
            official: false
        },
        {
            name: "International Day for Preventing Exploitation of Environment",
            official: true
        }
    ],
    "11-7": [
        {
            name: "International Medical Physics Day",
            official: false
        },
        {
            name: "World Cancer Awareness Day",
            official: false
        }
    ],
    "11-8": [
        {
            name: "World Urbanism Day",
            official: false
        },
        {
            name: "World Radiography Day",
            official: false
        },
        {
            name: "International Cappuccino Day",
            official: false
        }
    ],
    "11-9": [
        {
            name: "World Freedom Day",
            official: false
        },
        {
            name: "World Adoption Day",
            official: false
        }
    ],
    "11-10": [
        {
            name: "World Science Day for Peace and Development",
            official: true
        },
        {
            name: "International Accounting Day",
            official: false
        }
    ],
    "11-11": [
        {
            name: "Singles' Day",
            official: false
        },
        {
            name: "World Origami Day",
            official: false
        }
    ],
    "11-12": [
        {
            name: "World Pneumonia Day",
            official: true
        },
        {
            name: "World Quality Day",
            official: false
        }
    ],
    "11-13": [
        {
            name: "World Kindness Day",
            official: false
        },
        {
            name: "International Symphonic Day",
            official: false
        }
    ],
    "11-14": [
        {
            name: "World Diabetes Day",
            official: true
        },
        {
            name: "International Pickle Day",
            official: false
        }
    ],
    "11-15": [
        {
            name: "World Recycling Day",
            official: false
        },
        {
            name: "Clean Out Your Refrigerator Day",
            official: false
        }
    ],
    "11-16": [
        {
            name: "International Day for Tolerance",
            official: true
        },
        {
            name: "World Fast Food Day",
            official: false
        }
    ],
    "11-17": [
        {
            name: "World Prematurity Day",
            official: true
        },
        {
            name: "International Students' Day",
            official: false
        }
    ],
    "11-18": [
        {
            name: "World GIS Day",
            official: false
        },
        {
            name: "Mickey Mouse Day",
            official: false
        }
    ],
    "11-19": [
        {
            name: "World Toilet Day",
            official: true
        },
        {
            name: "International Men's Day",
            official: false
        }
    ],
    "11-20": [
        {
            name: "World Children's Day",
            official: true
        },
        {
            name: "Africa Industrialization Day",
            official: true
        }
    ],
    "11-21": [
        {
            name: "World Television Day",
            official: true
        },
        {
            name: "World Philosophy Day",
            official: true
        },
        {
            name: "World Hello Day",
            official: false
        }
    ],
    "11-22": [
        {
            name: "World Music Day",
            official: false
        },
        {
            name: "Go For a Ride Day",
            official: false
        }
    ],
    "11-23": [
        {
            name: "Fibonacci Day",
            official: false
        },
        {
            name: "World Espresso Day",
            official: false
        }
    ],
    "11-24": [
        {
            name: "World Evolution Day",
            official: false
        },
        {
            name: "Celebrate Your Unique Talent Day",
            official: false
        }
    ],
    "11-25": [
        {
            name: "World Organic Day",
            official: false
        },
        {
            name: "International Parfait Day",
            official: false
        }
    ],
    "11-26": [
        {
            name: "World Olive Tree Day",
            official: true
        },
        {
            name: "World Sustainable Transport Day",
            official: true
        }
    ],
    "11-27": [
        {
            name: "World Turtle Day",
            official: false
        },
        {
            name: "National Pins and Needles Day",
            official: false
        }
    ],
    "11-28": [
        {
            name: "Red Planet Day",
            official: false
        },
        {
            name: "French Toast Day",
            official: false
        }
    ],
    "11-29": [
        {
            name: "International Jaguar Day",
            official: false
        },
        {
            name: "World Lemon Day",
            official: false
        }
    ],
    "11-30": [
        {
            name: "Computer Security Day",
            official: false
        },
        {
            name: "Stay Home Because You're Well Day",
            official: false
        }
    ],
    "12-1": [
        {
            name: "World AIDS Day",
            official: true
        },
        {
            name: "Antarctica Day",
            official: false
        }
    ],
    "12-2": [
        {
            name: "World Computer Literacy Day",
            official: false
        },
        {
            name: "International Day for Abolition of Slavery",
            official: true
        }
    ],
    "12-3": [
        {
            name: "International Day of Persons with Disabilities",
            official: true
        },
        {
            name: "World 3D Printing Day",
            official: false
        }
    ],
    "12-4": [
        {
            name: "International Day of Banks",
            official: true
        },
        {
            name: "World Wildlife Conservation Day",
            official: false
        },
        {
            name: "World Cookie Day",
            official: false
        }
    ],
    "12-5": [
        {
            name: "World Soil Day",
            official: true
        },
        {
            name: "International Volunteer Day",
            official: true
        },
        {
            name: "World Ninja Day",
            official: false
        }
    ],
    "12-6": [
        {
            name: "St. Nicholas Day",
            official: false
        },
        {
            name: "Microwave Oven Day",
            official: false
        }
    ],
    "12-7": [
        {
            name: "International Civil Aviation Day",
            official: true
        },
        {
            name: "World Cotton Candy Day",
            official: false
        }
    ],
    "12-8": [
        {
            name: "World Climate Change Day",
            official: false
        },
        {
            name: "Pretend to Be a Time Traveler Day",
            official: false
        }
    ],
    "12-9": [
        {
            name: "World Techno Day",
            official: false
        },
        {
            name: "International Anti-Corruption Day",
            official: true
        },
        {
            name: "International Pastry Day",
            official: false
        }
    ],
    "12-10": [
        {
            name: "Human Rights Day",
            official: true
        },
        {
            name: "International Animal Rights Day",
            official: false
        }
    ],
    "12-11": [
        {
            name: "International Mountain Day",
            official: true
        },
        {
            name: "International Shareware Day",
            official: false
        }
    ],
    "12-12": [
        {
            name: "International Universal Health Coverage Day",
            official: true
        },
        {
            name: "International Day of Neutrality",
            official: true
        },
        {
            name: "Gingerbread House Day",
            official: false
        }
    ],
    "12-13": [
        {
            name: "World Violin Day",
            official: false
        },
        {
            name: "National Cocoa Day",
            official: false
        }
    ],
    "12-14": [
        {
            name: "World Monkey Day",
            official: false
        },
        {
            name: "International Free Shipping Day",
            official: false
        }
    ],
    "12-15": [
        {
            name: "International Tea Day",
            official: false
        },
        {
            name: "Cat Herders Day",
            official: false
        }
    ],
    "12-16": [
        {
            name: "World Covered in Chocolate Day",
            official: false
        },
        {
            name: "Zamenhof Day (Esperanto Day)",
            official: false
        }
    ],
    "12-17": [
        {
            name: "World Maple Syrup Day",
            official: false
        },
        {
            name: "Wright Brothers Day",
            official: false
        }
    ],
    "12-18": [
        {
            name: "International Migrants Day",
            official: true
        },
        {
            name: "Arabic Language Day",
            official: true
        },
        {
            name: "Bake Cookies Day",
            official: false
        }
    ],
    "12-19": [
        {
            name: "World Emotion Day",
            official: false
        },
        {
            name: "Look for an Evergreen Day",
            official: false
        }
    ],
    "12-20": [
        {
            name: "International Human Solidarity Day",
            official: true
        },
        {
            name: "World Sangria Day",
            official: false
        }
    ],
    "12-21": [
        {
            name: "World Basketball Day",
            official: true
        },
        {
            name: "Global Orgasm Day",
            official: false
        },
        {
            name: "Crossword Puzzle Day",
            official: false
        }
    ],
    "12-22": [
        {
            name: "World Date Day",
            official: false
        },
        {
            name: "National Date Nut Bread Day",
            official: false
        }
    ],
    "12-23": [
        {
            name: "Festivus",
            official: false
        },
        {
            name: "Roots Day",
            official: false
        }
    ],
    "12-24": [
        {
            name: "Christmas Eve",
            official: false
        },
        {
            name: "National Eggnog Day",
            official: false
        }
    ],
    "12-25": [
        {
            name: "Christmas Day",
            official: false
        },
        {
            name: "APhA Birthday",
            official: false
        }
    ],
    "12-26": [
        {
            name: "Boxing Day",
            official: false
        },
        {
            name: "National Candy Cane Day",
            official: false
        }
    ],
    "12-27": [
        {
            name: "International Day of Epidemic Preparedness",
            official: true
        },
        {
            name: "World Fruitcake Day",
            official: false
        }
    ],
    "12-28": [
        {
            name: "World Cinema Day",
            official: false
        },
        {
            name: "Pledge Day",
            official: false
        }
    ],
    "12-29": [
        {
            name: "International Cello Day",
            official: false
        },
        {
            name: "Tick Tock Day",
            official: false
        }
    ],
    "12-30": [
        {
            name: "World Bacon Day",
            official: false
        },
        {
            name: "Falling Needles Family Fest Day",
            official: false
        }
    ],
    "12-31": [
        {
            name: "New Year's Eve",
            official: false
        },
        {
            name: "World Peace Meditation Day",
            official: false
        }
    ]
};