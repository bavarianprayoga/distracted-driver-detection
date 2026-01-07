import pickle

with open("svm_model.pkl", "rb") as f:
    model = pickle.load(f)

print("Model loaded successfully!")
print(type(model))