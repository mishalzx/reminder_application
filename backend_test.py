#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Reminder Application
Tests all authentication and reminder management endpoints
"""

import requests
import json
import time
from datetime import datetime, timedelta
import os

# Get base URL from environment
BASE_URL = "https://task-reminder-49.preview.emergentagent.com/api"

class ReminderAppTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.auth_token = None
        self.test_user_id = None
        self.test_user_email = None
        self.test_user_password = "password123"
        self.created_reminders = []
        self.test_results = {
            "auth_register": {"status": "pending", "details": ""},
            "auth_login": {"status": "pending", "details": ""},
            "auth_me": {"status": "pending", "details": ""},
            "reminder_create": {"status": "pending", "details": ""},
            "reminder_get_all": {"status": "pending", "details": ""},
            "reminder_update": {"status": "pending", "details": ""},
            "reminder_delete": {"status": "pending", "details": ""},
            "reminder_check": {"status": "pending", "details": ""}
        }

    def log_result(self, test_name, success, details):
        """Log test result"""
        status = "passed" if success else "failed"
        self.test_results[test_name] = {"status": status, "details": details}
        print(f"✅ {test_name}: {status}" if success else f"❌ {test_name}: {status}")
        if details:
            print(f"   Details: {details}")

    def test_auth_register(self):
        """Test user registration"""
        print("\n🔐 Testing User Registration...")
        
        # Use timestamp to ensure unique email
        timestamp = int(time.time())
        self.test_user_email = f"testuser{timestamp}@example.com"
        test_data = {
            "name": "Test User",
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        try:
            response = requests.post(f"{self.base_url}/auth/register", json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    self.auth_token = data["token"]
                    self.test_user_id = data["user"]["id"]
                    self.log_result("auth_register", True, f"User registered successfully with ID: {self.test_user_id}")
                    return True
                else:
                    self.log_result("auth_register", False, "Missing token or user data in response")
                    return False
            else:
                self.log_result("auth_register", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("auth_register", False, f"Exception: {str(e)}")
            return False

    def test_auth_login(self):
        """Test user login"""
        print("\n🔑 Testing User Login...")
        
        if not self.test_user_email:
            self.log_result("auth_login", False, "No test user email available for login")
            return False
            
        test_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        try:
            response = requests.post(f"{self.base_url}/auth/login", json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    # Update token from login
                    self.auth_token = data["token"]
                    self.log_result("auth_login", True, f"Login successful for user: {data['user']['email']}")
                    return True
                else:
                    self.log_result("auth_login", False, "Missing token or user data in response")
                    return False
            else:
                self.log_result("auth_login", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("auth_login", False, f"Exception: {str(e)}")
            return False

    def test_auth_me(self):
        """Test get user profile"""
        print("\n👤 Testing Get User Profile...")
        
        if not self.auth_token:
            self.log_result("auth_me", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = requests.get(f"{self.base_url}/auth/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "user" in data and "password" not in data["user"]:
                    self.log_result("auth_me", True, f"Profile retrieved for user: {data['user']['email']}")
                    return True
                else:
                    self.log_result("auth_me", False, "Invalid user data or password exposed")
                    return False
            else:
                self.log_result("auth_me", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("auth_me", False, f"Exception: {str(e)}")
            return False

    def test_reminder_create(self):
        """Test creating reminders"""
        print("\n📝 Testing Reminder Creation...")
        
        if not self.auth_token:
            self.log_result("reminder_create", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test creating multiple reminders with different frequencies
        test_reminders = [
            {
                "name": "Daily Standup Meeting",
                "description": "Daily team standup meeting reminder",
                "date": (datetime.now() + timedelta(days=1)).isoformat(),
                "email": "testuser@example.com",
                "reminderDate": (datetime.now() + timedelta(hours=1)).isoformat(),
                "frequency": "daily"
            },
            {
                "name": "Weekly Report",
                "description": "Submit weekly progress report",
                "date": (datetime.now() + timedelta(days=7)).isoformat(),
                "email": "testuser@example.com",
                "reminderDate": (datetime.now() + timedelta(days=6)).isoformat(),
                "frequency": "weekly"
            },
            {
                "name": "One-time Meeting",
                "description": "Important client meeting",
                "date": (datetime.now() + timedelta(days=2)).isoformat(),
                "email": "testuser@example.com",
                "reminderDate": (datetime.now() + timedelta(days=1, hours=23)).isoformat(),
                "frequency": "once"
            }
        ]
        
        created_count = 0
        
        for reminder_data in test_reminders:
            try:
                response = requests.post(f"{self.base_url}/reminders", json=reminder_data, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    if "reminder" in data:
                        self.created_reminders.append(data["reminder"]["id"])
                        created_count += 1
                        print(f"   ✅ Created {reminder_data['frequency']} reminder: {reminder_data['name']}")
                    else:
                        print(f"   ❌ Invalid response for {reminder_data['name']}")
                else:
                    print(f"   ❌ Failed to create {reminder_data['name']}: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"   ❌ Exception creating {reminder_data['name']}: {str(e)}")
        
        if created_count == len(test_reminders):
            self.log_result("reminder_create", True, f"Successfully created {created_count} reminders")
            return True
        else:
            self.log_result("reminder_create", False, f"Only created {created_count}/{len(test_reminders)} reminders")
            return False

    def test_reminder_get_all(self):
        """Test getting all reminders"""
        print("\n📋 Testing Get All Reminders...")
        
        if not self.auth_token:
            self.log_result("reminder_get_all", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = requests.get(f"{self.base_url}/reminders", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "reminders" in data:
                    reminders = data["reminders"]
                    self.log_result("reminder_get_all", True, f"Retrieved {len(reminders)} reminders")
                    return True
                else:
                    self.log_result("reminder_get_all", False, "Missing reminders array in response")
                    return False
            else:
                self.log_result("reminder_get_all", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("reminder_get_all", False, f"Exception: {str(e)}")
            return False

    def test_reminder_update(self):
        """Test updating a reminder"""
        print("\n✏️ Testing Reminder Update...")
        
        if not self.auth_token or not self.created_reminders:
            self.log_result("reminder_update", False, "No auth token or reminders available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        reminder_id = self.created_reminders[0]  # Update first reminder
        
        update_data = {
            "name": "Updated Daily Standup Meeting",
            "frequency": "weekly",
            "description": "Updated description for the meeting"
        }
        
        try:
            response = requests.put(f"{self.base_url}/reminders/{reminder_id}", json=update_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "reminder" in data:
                    updated_reminder = data["reminder"]
                    if updated_reminder["name"] == update_data["name"]:
                        self.log_result("reminder_update", True, f"Successfully updated reminder: {reminder_id}")
                        return True
                    else:
                        self.log_result("reminder_update", False, "Reminder not properly updated")
                        return False
                else:
                    self.log_result("reminder_update", False, "Missing reminder in response")
                    return False
            else:
                self.log_result("reminder_update", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("reminder_update", False, f"Exception: {str(e)}")
            return False

    def test_reminder_delete(self):
        """Test deleting a reminder"""
        print("\n🗑️ Testing Reminder Deletion...")
        
        if not self.auth_token or not self.created_reminders:
            self.log_result("reminder_delete", False, "No auth token or reminders available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        reminder_id = self.created_reminders[-1]  # Delete last reminder
        
        try:
            response = requests.delete(f"{self.base_url}/reminders/{reminder_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.created_reminders.remove(reminder_id)
                    self.log_result("reminder_delete", True, f"Successfully deleted reminder: {reminder_id}")
                    return True
                else:
                    self.log_result("reminder_delete", False, "Missing success message")
                    return False
            else:
                self.log_result("reminder_delete", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("reminder_delete", False, f"Exception: {str(e)}")
            return False

    def test_reminder_check(self):
        """Test manual reminder check"""
        print("\n⏰ Testing Manual Reminder Check...")
        
        try:
            response = requests.get(f"{self.base_url}/reminders/check")
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result("reminder_check", True, "Manual reminder check completed successfully")
                    return True
                else:
                    self.log_result("reminder_check", False, "Missing success message")
                    return False
            else:
                self.log_result("reminder_check", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("reminder_check", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("🚀 Starting Comprehensive Backend API Testing...")
        print(f"Base URL: {self.base_url}")
        
        # Authentication Tests
        if not self.test_auth_register():
            print("❌ Registration failed - stopping tests")
            return False
            
        if not self.test_auth_login():
            print("❌ Login failed - continuing with other tests")
            
        if not self.test_auth_me():
            print("❌ Profile retrieval failed - continuing with other tests")
        
        # Reminder Tests
        if not self.test_reminder_create():
            print("❌ Reminder creation failed - continuing with other tests")
            
        self.test_reminder_get_all()
        self.test_reminder_update()
        self.test_reminder_delete()
        self.test_reminder_check()
        
        # Print summary
        self.print_summary()
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("📊 BACKEND API TEST SUMMARY")
        print("="*60)
        
        passed = 0
        failed = 0
        
        for test_name, result in self.test_results.items():
            status_icon = "✅" if result["status"] == "passed" else "❌" if result["status"] == "failed" else "⏸️"
            print(f"{status_icon} {test_name.replace('_', ' ').title()}: {result['status'].upper()}")
            
            if result["status"] == "passed":
                passed += 1
            elif result["status"] == "failed":
                failed += 1
        
        print(f"\n📈 Results: {passed} passed, {failed} failed, {len(self.test_results) - passed - failed} pending")
        
        if failed == 0:
            print("🎉 All backend tests passed successfully!")
        else:
            print(f"⚠️ {failed} tests failed - check details above")

if __name__ == "__main__":
    tester = ReminderAppTester()
    tester.run_all_tests()