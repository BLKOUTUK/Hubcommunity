import app

# Print all routes in the app
print("Routes in app.py:")
for rule in app.app.url_map.iter_rules():
    print(f"- {rule.rule} [{', '.join(rule.methods)}]")
