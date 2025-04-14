from flask import Flask, jsonify
from rewards_manager import RewardsManager

app = Flask(__name__)
rewards_manager = RewardsManager()

@app.route('/api/rewards/actions', methods=['GET'])
def get_reward_actions():
    """Get all reward actions."""
    try:
        # Get all reward actions
        actions = rewards_manager.get_reward_actions()
        return jsonify({"success": True, "actions": actions}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
