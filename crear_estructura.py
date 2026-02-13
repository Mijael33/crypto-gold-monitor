import os

# Ruta base del proyecto
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(BASE_DIR, 'src', 'app')

# 1. CARPETAS - SOLO ESTRUCTURA
FOLDERS = [
    'core/services',
    'core/workers',
    'shared/directives',
    'shared/models',
    'features/crypto-card',
    'features/crypto-list',
]

# 2. ARCHIVOS VACÍOS - SOLO PARA Luego COPIAR Y PEGAR
EMPTY_FILES = [
    'core/services/crypto.service.ts',
    'core/workers/crypto-worker.worker.ts',
    'shared/directives/highlight-change.directive.ts',
    'shared/models/crypto.models.ts',
    'features/crypto-card/crypto-card.component.ts',
    'features/crypto-card/crypto-card.component.html',
    'features/crypto-card/crypto-card.component.scss',
    'features/crypto-list/crypto-list.component.ts',
    'features/crypto-list/crypto-list.component.html',
    'features/crypto-list/crypto-list.component.scss',
]

def crear_estructura():
    """Crea SOLO carpetas y archivos vacíos"""
    
    print("🚀 Creando estructura del proyecto...\n")
    
    # Crear carpetas
    for folder in FOLDERS:
        folder_path = os.path.join(APP_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)
        print(f"📁 Carpeta creada: {folder}")
    
    print("\n" + "="*50 + "\n")
    
    # Crear archivos vacíos
    for file in EMPTY_FILES:
        file_path = os.path.join(APP_DIR, file)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('')  # Archivo vacío
        print(f"📄 Archivo creado: {file}")
    
    print("\n" + "="*50)
    print("\n✅ ESTRUCTURA CREADA EXITOSAMENTE")
    print("📌 AHORA COPIA Y PEGA EL CÓDIGO QUE TE ENVIÉ EN CADA ARCHIVO")
    print("="*50)

if __name__ == "__main__":
    crear_estructura()