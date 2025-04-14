import unittest
import sys
import os

# Add the current directory to the path so we can import the modules
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

def run_tests():
    """Run all test cases."""
    # Create a test loader
    loader = unittest.TestLoader()

    # Create a test suite
    suite = unittest.TestSuite()

    # Add test cases to the suite
    suite.addTests(loader.discover('.', pattern='test_*.py'))

    # Create a test runner
    runner = unittest.TextTestRunner(verbosity=2)

    # Run the tests
    result = runner.run(suite)

    # Return the result
    return result.wasSuccessful()

if __name__ == '__main__':
    # Run the tests
    success = run_tests()

    # Exit with appropriate code
    sys.exit(0 if success else 1)
