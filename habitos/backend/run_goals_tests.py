#!/usr/bin/env python3
"""
Test runner for goals functionality
Runs both integration tests and unit tests
"""

import subprocess
import sys
import os
from pathlib import Path

def run_integration_tests():
    """Run the integration tests"""
    print("🧪 Running Goals Integration Tests")
    print("=" * 50)
    
    try:
        # Run the integration test script
        result = subprocess.run([sys.executable, "test_goals.py"], 
                              capture_output=True, text=True, cwd=os.getcwd())
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        if result.returncode == 0:
            print("✅ Integration tests completed successfully")
            return True
        else:
            print(f"❌ Integration tests failed with return code {result.returncode}")
            return False
            
    except Exception as e:
        print(f"❌ Error running integration tests: {e}")
        return False

def run_unit_tests():
    """Run the unit tests with pytest"""
    print("\n🧪 Running Goals Unit Tests")
    print("=" * 50)
    
    try:
        # Check if pytest is available
        result = subprocess.run([sys.executable, "-m", "pytest", "--version"], 
                              capture_output=True, text=True)
        
        if result.returncode != 0:
            print("❌ pytest not available. Install with: pip install pytest")
            return False
        
        # Run the unit tests
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "tests/test_goals.py", 
            "-v",  # Verbose output
            "--tb=short"  # Short traceback format
        ], capture_output=True, text=True, cwd=os.getcwd())
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        if result.returncode == 0:
            print("✅ Unit tests completed successfully")
            return True
        else:
            print(f"❌ Unit tests failed with return code {result.returncode}")
            return False
            
    except Exception as e:
        print(f"❌ Error running unit tests: {e}")
        return False

def check_backend_running():
    """Check if the backend is running"""
    import requests
    
    try:
        response = requests.get("http://localhost:5001/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print("❌ Backend is not responding correctly")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running. Please start it first:")
        print("   cd habitos/backend")
        print("   python run.py")
        return False
    except Exception as e:
        print(f"❌ Error checking backend: {e}")
        return False

def main():
    """Main test runner"""
    print("🎯 Goals Backend Test Suite")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists("test_goals.py"):
        print("❌ Please run this script from the backend directory")
        print("   cd habitos/backend")
        print("   python run_goals_tests.py")
        sys.exit(1)
    
    # Check if backend is running (for integration tests)
    backend_running = check_backend_running()
    
    # Run tests
    integration_success = False
    unit_success = False
    
    if backend_running:
        integration_success = run_integration_tests()
    else:
        print("⚠️  Skipping integration tests (backend not running)")
    
    unit_success = run_unit_tests()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    
    if backend_running:
        print(f"Integration Tests: {'✅ PASSED' if integration_success else '❌ FAILED'}")
    else:
        print("Integration Tests: ⚠️  SKIPPED (backend not running)")
    
    print(f"Unit Tests: {'✅ PASSED' if unit_success else '❌ FAILED'}")
    
    if backend_running and integration_success and unit_success:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    elif unit_success:
        print("\n⚠️  Unit tests passed, but integration tests failed or were skipped")
        sys.exit(1)
    else:
        print("\n❌ Some tests failed")
        sys.exit(1)

if __name__ == "__main__":
    main() 