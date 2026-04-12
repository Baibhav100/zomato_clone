import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import sys
import json
import os

# Set encoding for Windows compatibility
sys.stdout.reconfigure(encoding='utf-8')

def load_and_clean_data(file_path):
    # Load CSV - only necessary columns to save memory
    cols = ['name', 'address', 'cuisines', 'rest_type', 'dish_liked', 'listed_in(type)']
    df = pd.read_csv(file_path, usecols=cols)
    
    # Drop duplicates (Zomato data has many duplicate entries for different city listings)
    df.drop_duplicates(subset=['name', 'address'], keep='first', inplace=True)
    df.reset_index(drop=True, inplace=True)
    
    # Fill missing values
    df['cuisines'] = df['cuisines'].fillna('')
    df['rest_type'] = df['rest_type'].fillna('')
    df['dish_liked'] = df['dish_liked'].fillna('')
    
    # Create the "Soup" - a combination of all features
    df['soup'] = df['cuisines'] + " " + df['rest_type'] + " " + df['dish_liked'] + " " + df['listed_in(type)']
    df['soup'] = df['soup'].str.lower()
    
    return df

def get_recommendations(restaurant_name, df, top_n=6):
    # Check if name exists
    if not df[df['name'].str.contains(restaurant_name, case=False, na=False)].empty:
        idx = df[df['name'].str.contains(restaurant_name, case=False, na=False)].index[0]
    else:
        return []
    
    # Vectorize the Metadata Soup
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(df['soup'])
    
    # Calculate cosine similarity for the specific restaurant
    # We only compute one row of the matrix to save memory
    cosine_sim = cosine_similarity(tfidf_matrix[idx], tfidf_matrix).flatten()
    
    # Get indices of top similar restaurants
    sim_scores = list(enumerate(cosine_sim))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_indices = [i[0] for i in sim_scores[1:top_n+1]]
    
    return df.iloc[sim_indices]['name'].tolist()

def classify_user(past_categories):
    if not past_categories:
        return {"classification": "New Foodie", "description": "Welcome! Explore our menu to find your style.", "recommendations": "Start with local favorites!"}
    
    # Process categories to find most common
    all_cats = " ".join(past_categories).lower()
    if 'cafe' in all_cats or 'bakery' in all_cats:
        return {"classification": "Cafe Enthusiast", "description": "You love cozy vibes and baked treats.", "recommendations": "Check out these top-rated cafes!"}
    if 'biryani' in all_cats or 'north indian' in all_cats:
        return {"classification": "Spice Lover", "description": "You have a taste for authentic, bold flavors.", "recommendations": "We found some spicy North Indian gems for you."}
    if 'delivery' in all_cats:
        return {"classification": "Comfort Foodie", "description": "You appreciate great food from the comfort of your home.", "recommendations": "Quick delivery favorites coming up!"}
        
    return {"classification": "Curious Explorer", "description": "You have a diverse palate!", "recommendations": "Try these trending mult-cuisine spots."}

def describe_food(food_name, res_name):
    templates = [
        f"The {food_name} at {res_name} is a masterpiece of flavor, combining fresh ingredients with expert technique.",
        f"Experience the authentic texture and rich aroma of {food_name}, a signature highlight of {res_name}.",
        f"A must-try at {res_name}, this {food_name} offers a perfect balance of traditional and modern tastes."
    ]
    return templates[hash(food_name) % len(templates)]

if __name__ == "__main__":
    try:
        csv_path = os.path.join(os.path.dirname(__file__), 'data', 'zomato.csv')
        
        # Determine mode
        mode = sys.argv[1] if len(sys.argv) > 1 else 'status'
        
        if mode == 'recommend':
            query = sys.argv[2]
            df = load_and_clean_data(csv_path).head(5000)
            print(json.dumps(get_recommendations(query, df)))
        elif mode == 'classify':
            cats = sys.argv[2:]
            print(json.dumps(classify_user(cats)))
        elif mode == 'describe':
            food = sys.argv[2]
            res = sys.argv[3]
            print(json.dumps({"result": describe_food(food, res)}))
        else:
            print(json.dumps({"status": "ready"}))
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))

