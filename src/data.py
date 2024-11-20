from flask import Flask, jsonify, request
import numpy as np
import tensorflow as tf
import pickle 
import os

app = Flask(__name__)

# Load models for Jogja
jogja_models = {
    'cnn': tf.keras.models.load_model('data/models/jogja_cnn.h5'),
    'rnn': tf.keras.models.load_model('data/models/jogja_rnn.h5'),
    'lstm': tf.keras.models.load_model('data/models/jogja_lstm.h5'),
    'gru': tf.keras.models.load_model('data/models/jogja_gru.h5'),
    'sarima': pickle.load(open('data/models/jogja_sarima.pkl', 'rb'))
}

# Load models for Tangsel
tangsel_models = {
    'cnn': tf.keras.models.load_model('data/models/tangsel_cnn.h5'),
    'rnn': tf.keras.models.load_model('data/models/tangsel_rnn.h5'),
    'lstm': tf.keras.models.load_model('data/models/tangsel_lstm.h5'),
    'gru': tf.keras.models.load_model('data/models/tangsel_gru.h5'),
    'sarima': pickle.load(open('data/models/tangsel_sarima.pkl', 'rb'))
}

# Example function to generate predictions
def predict_with_model(model, input_data, model_type='deep_learning'):
    if model_type == 'deep_learning':
        # Assuming deep learning models expect a certain input shape
        predictions = model.predict(input_data)
    elif model_type == 'sarima':
        # SARIMA model needs to be used for time series forecasting
        predictions = model.predict(n_periods=len(input_data))
    return predictions.tolist()

@app.route('/api/prediction', methods=['GET'])
def get_prediction():
    location = request.args.get('location')
    pollutant = request.args.get('pollutant')

    # Validate input
    if not location or not pollutant:
        return jsonify({"error": "Missing required parameters: location or pollutant"}), 400

    if location == 'jogja':
        models = jogja_models
    elif location == 'tangsel':
        models = tangsel_models
    else:
        return jsonify({"error": "Invalid location"}), 400

    # Here, you should define the structure of the input data based on the pollutant selected
    input_data = np.array([[pollutant]])  # Replace with actual input data preprocessing
    
    # Predict with all models
    predictions = {}
    for model_name, model in models.items():
        model_type = 'deep_learning' if model_name != 'sarima' else 'sarima'  # Check if the model is SARIMA
        predictions[model_name] = predict_with_model(model, input_data, model_type)

    # Format the prediction data
    # Assuming the predictions contain time-series data with values for each timestamp
    prediction_response = {
        "location": location,
        "pollutant": pollutant,
        "predictions": predictions
    }

    return jsonify(prediction_response)

if __name__ == '__main__':
    app.run(debug=True)
