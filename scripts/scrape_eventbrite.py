import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import time
import os
from typing import List, Dict, Any

class EventbriteScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.base_url = 'https://www.eventbrite.com'
        
    def get_event_details(self, event_url: str) -> Dict[str, Any]:
        """
        Scrape details from a single Eventbrite event page
        """
        try:
            response = requests.get(event_url, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract event details
            event_data = {
                'title': self._get_text(soup, 'h1'),
                'description': self._get_text(soup, '[data-testid="event-description"]'),
                'date': self._get_text(soup, '[data-testid="event-datetime"]'),
                'location': self._get_text(soup, '[data-testid="event-location"]'),
                'organizer': self._get_text(soup, '[data-testid="organizer-name"]'),
                'url': event_url,
                'scraped_at': datetime.now().isoformat()
            }
            
            return event_data
            
        except Exception as e:
            print(f"Error scraping event {event_url}: {str(e)}")
            return None
    
    def search_events(self, query: str, location: str = None, page: int = 1) -> List[Dict[str, Any]]:
        """
        Search for events on Eventbrite
        """
        search_url = f"{self.base_url}/search"
        params = {
            'q': query,
            'page': page
        }
        if location:
            params['location'] = location
            
        try:
            response = requests.get(search_url, params=params, headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            events = []
            event_cards = soup.find_all('div', {'data-testid': 'event-card'})
            
            for card in event_cards:
                event_link = card.find('a', href=True)
                if event_link:
                    event_url = self.base_url + event_link['href']
                    event_details = self.get_event_details(event_url)
                    if event_details:
                        events.append(event_details)
                    time.sleep(1)  # Be nice to Eventbrite's servers
                    
            return events
            
        except Exception as e:
            print(f"Error searching events: {str(e)}")
            return []
    
    def _get_text(self, soup: BeautifulSoup, selector: str) -> str:
        """
        Helper method to safely extract text from a BeautifulSoup element
        """
        element = soup.select_one(selector)
        return element.text.strip() if element else ''

def save_events(events: List[Dict[str, Any]], filename: str = 'eventbrite_events.json'):
    """
    Save scraped events to a JSON file
    """
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(events, f, indent=2, ensure_ascii=False)

def main():
    scraper = EventbriteScraper()
    
    # Example usage
    search_query = "LGBTQ+ community events"
    location = "London, UK"
    
    print(f"Searching for events matching: {search_query} in {location}")
    events = scraper.search_events(search_query, location)
    
    if events:
        print(f"Found {len(events)} events")
        save_events(events)
        print(f"Events saved to eventbrite_events.json")
    else:
        print("No events found")

if __name__ == "__main__":
    main() 