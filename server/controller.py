from flask import Flask, request
import rospy
from geometry_msgs.msg import Twist

app = Flask(__name__)
rospy.init_node('blockchain_robot_controller')
cmd_vel_pub = rospy.Publisher('/cmd_vel', Twist, queue_size=1)

@app.route('/move_robot', methods=['POST'])
def move_robot():
    data = request.json
    priority = data.get('priority', 1)
    
    twist = Twist()
    twist.linear.x = 0.5 + (priority * 0.1)
    cmd_vel_pub.publish(twist)
    
    return {'status': 'moving', 'priority': priority}

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)