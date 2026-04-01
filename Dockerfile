# Build a slim Python environment optimized for heavy machine learning
FROM python:3.9-slim

# Install system-level dependencies for computer vision (OpenCV/Pillow)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set up the working directory inside the container
WORKDIR /app

# We require highly specific directory creation for Flask and SQLite databases
RUN mkdir -p static/uploads instance \
    && chmod -R 777 static/uploads instance

# Copy everything from our workspace over to the Docker container
COPY . /app

# Upgrade pip and install standard python dependencies
# Note: By default, we override any local PyTorch config to download the CPU-only version for cloud hosting!
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# The Hugging Face platform strictly exposes port 7860
EXPOSE 7860

# We use Gunicorn to run the Flask WSGI system in production!
CMD ["gunicorn", "-b", "0.0.0.0:7860", "--workers=2", "--timeout=120", "app:app"]
