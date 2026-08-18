#!/usr/bin/env python3
"""
Test script to verify backend deployment readiness
"""
import sys
import os

def test_imports():
    """Test that all required dependencies can be imported"""
    print("Testing imports...")
    try:
        import fastapi
        print("✓ FastAPI")
    except ImportError as e:
        print(f"✗ FastAPI: {e}")
        return False
    
    try:
        import uvicorn
        print("✓ Uvicorn")
    except ImportError as e:
        print(f"✗ Uvicorn: {e}")
        return False
    
    try:
        import PIL
        print("✓ Pillow")
    except ImportError as e:
        print(f"✗ Pillow: {e}")
        return False
    
    try:
        import numpy
        print("✓ NumPy")
    except ImportError as e:
        print(f"✗ NumPy: {e}")
        return False
    
    try:
        import slowapi
        print("✓ SlowAPI")
    except ImportError as e:
        print(f"✗ SlowAPI: {e}")
        return False
    
    try:
        from jose import jwt
        print("✓ python-jose")
    except ImportError as e:
        print(f"✗ python-jose: {e}")
        return False
    
    try:
        from passlib.context import CryptContext
        print("✓ passlib")
    except ImportError as e:
        print(f"✗ passlib: {e}")
        return False
    
    return True

def test_app_creation():
    """Test that the FastAPI app can be created"""
    print("\nTesting app creation...")
    try:
        from app import app
        print("✓ FastAPI app created successfully")
        return True
    except Exception as e:
        print(f"✗ App creation failed: {e}")
        return False

def test_security_module():
    """Test that security module loads"""
    print("\nTesting security module...")
    try:
        from security import limiter, validate_api_key, require_api_key
        print("✓ Security module loaded successfully")
        return True
    except Exception as e:
        print(f"✗ Security module failed: {e}")
        return False

def test_configuration():
    """Test environment configuration"""
    print("\nTesting configuration...")
    try:
        from app import IS_PRODUCTION, RATE_LIMIT_REQUESTS, RATE_LIMIT_PERIOD
        print(f"✓ Environment: {'production' if IS_PRODUCTION else 'development'}")
        print(f"✓ Rate limit: {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_PERIOD} seconds")
        return True
    except Exception as e:
        print(f"✗ Configuration check failed: {e}")
        return False

def test_deployment_files():
    """Test that deployment files exist"""
    print("\nTesting deployment files...")
    required_files = [
        'Procfile',
        'runtime.txt',
        'requirements.txt',
        '.env.production'
    ]
    
    all_exist = True
    for file in required_files:
        if os.path.exists(file):
            print(f"✓ {file}")
        else:
            print(f"✗ {file} (missing)")
            all_exist = False
    
    return all_exist

def main():
    print("=== Backend Deployment Readiness Test ===\n")
    
    results = []
    results.append(("Imports", test_imports()))
    results.append(("App Creation", test_app_creation()))
    results.append(("Security Module", test_security_module()))
    results.append(("Configuration", test_configuration()))
    results.append(("Deployment Files", test_deployment_files()))
    
    print("\n=== Test Results ===")
    all_passed = True
    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\n✓ All tests passed! Backend is ready for deployment.")
        return 0
    else:
        print("\n✗ Some tests failed. Please fix the issues before deploying.")
        return 1

if __name__ == "__main__":
    sys.exit(main())