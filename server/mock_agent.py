import requests
import time

def send_order(priority: int):
    try:
        response = requests.post(
            'http://localhost:5000/move_robot',
            json={'priority': priority}
        )
        print(f"Robot moving with priority {priority}: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    while True:
        priority = int(input("Enter priority (1-10): "))
        send_order(priority)