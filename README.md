# skin-cancer-ai-absention

## Kaggle dataset setup

Install the Kaggle Python package:

```bash
pip install kaggle
```

Authenticate with your `kaggle.json` API token:

```bash
mkdir -p ~/.kaggle
cp /path/to/kaggle.json ~/.kaggle/kaggle.json
chmod 600 ~/.kaggle/kaggle.json
```

Download the `siim-isic-melanoma-classification` dataset into a local `data/` folder:

```bash
mkdir -p data
kaggle competitions download -c siim-isic-melanoma-classification -p data/
```
