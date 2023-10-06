import logging
import os
import json
import base64
import time
from selenium.webdriver.chrome.service import Service
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

# example to get cookie:
ALB_URL = ''
USERNAME = ''
PASSWORD = ''

log = logging.getLogger()
log.setLevel('INFO')

def handler(event, context):
    cookie = get_cookies(ALB_URL, USERNAME, PASSWORD)
    # 你的代码逻辑
    return {
        "statusCode": 200,
        "body": json.dumps(cookie)
    }

def get_cookies(alb_url, username, password):

    log.info(f"login: {alb_url}, username: {username}")
    chrome_options = ChromeOptions()
    chrome_options.binary_location = "/opt/chrome/chrome"
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-dev-tools")
    chrome_options.add_argument("--no-zygote")
    chrome_options.add_argument("--single-process")

    log.info(chrome_options.arguments)

    service = Service(executable_path="/opt/chromedriver")
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.get(alb_url)
    
    WebDriverWait(driver, 20).until(lambda driver: driver.execute_script('return document.readyState') == 'complete')
    # simulate to input username, password and submit
    # e_index = 0
    # username_input = driver.find_elements(by=By.NAME, value="username")[e_index]
    # username_input.send_keys(username)    
    # password_input = driver.find_elements(by=By.NAME, value="password")[e_index]
    # password_input.send_keys(password)
    # submit_button = driver.find_elements(by=By.NAME, value="action")[e_index]
    # submit_button.click() 

    e_index = 0
    username_input = driver.find_elements(by=By.NAME, value="username")[e_index]
    username_input.send_keys(username)
    password_input = driver.find_elements(by=By.NAME, value="password")[e_index]
    password_input.send_keys(password)
    submit_button = driver.find_elements(by=By.NAME, value="login")[e_index]
    submit_button.click()      


    cookies = driver.get_cookies()
    current_url = driver.current_url
    driver.quit()
    log.info(f"current_url: {current_url}")
    
    if current_url == alb_url:
        log.info("Login successfully")
    else:
        log.info("Login failed")
        return {
            'expireAt': 60 + int(time.time()),
            'error': True,
            'message': 'Authentication Error'
        }

    cookies_values=[]
    for c in cookies:
        c_name = c['name']
        c_value = c['value']
        cookies_values.append(f"{c_name}={c_value}")
    cookies_header = "; ".join(cookies_values)
    return cookies_header
    
     



