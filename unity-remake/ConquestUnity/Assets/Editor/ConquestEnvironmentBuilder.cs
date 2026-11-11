#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using Conquest.UnityRemake;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.SceneManagement;

namespace Conquest.UnityRemake.Editor
{
    /// <summary>
    /// Gera um vertical slice 3D original em URP sem dependencias de modelos comerciais.
    /// O mapa, as texturas e os materiais ficam salvos como assets editaveis na pasta Generated.
    /// Na primeira abertura: configure URP Asset em Project Settings > Graphics.
    /// </summary>
    public static class ConquestEnvironmentBuilder
    {
        private const string Generated = "Assets/ConquestGenerated";
        private const string ScenePath = "Assets/Scenes/ValeDosConjuntos.unity";
        private const int TerrainResolution = 257;
        private const float TerrainWidth = 260f;
        private static Terrain terrain;
        private static Transform root;
        private static readonly Dictionary<string, Material> Materials = new Dictionary<string, Material>();
        private static Mesh coneMesh;
        private static Mesh crystalMesh;
        private static System.Random random;

        [MenuItem("Tools/Conquest/Gerar cenario 3D URP")]
        public static void Generate()
        {
            if (!(GraphicsSettings.currentRenderPipeline is UniversalRenderPipelineAsset))
            {
                EditorUtility.DisplayDialog("Conquest - URP necessario",
                    "Antes de gerar o cenario: Assets > Create > Rendering > URP Asset (with Universal Renderer). " +
                    "Depois atribua o URP Asset em Edit > Project Settings > Graphics (Default Render Pipeline). " +
                    "Se ja usa o template Universal 3D, confira tambem Quality Settings.", "Entendi");
                return;
            }

            if (!EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo()) return;
            if (AssetDatabase.IsValidFolder(Generated) &&
                !EditorUtility.DisplayDialog("Reconstruir o cenario?",
                    "Isto substitui exclusivamente Assets/ConquestGenerated e a cena " + ScenePath +
                    ". Edicoes manuais nesses arquivos serao perdidas. Continuar?", "Sim, reconstruir", "Cancelar"))
                return;

            try
            {
                EditorUtility.DisplayProgressBar("Conquest", "Preparando assets do ambiente...", .05f);
                if (AssetDatabase.IsValidFolder(Generated)) AssetDatabase.DeleteAsset(Generated);
                EnsureFolder(Generated);
                EnsureFolder("Assets/Scenes");
                Materials.Clear();
                random = new System.Random(20261111);

                Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
                root = new GameObject("CONQUEST - Vale dos Conjuntos").transform;

                SetupMaterials();
                SetupMeshes();
                EditorUtility.DisplayProgressBar("Conquest", "Gerando relevo e texturas...", .2f);
                CreateTerrain();
                EditorUtility.DisplayProgressBar("Conquest", "Construindo vila, arvores e castelo...", .46f);
                CreateVillage();
                CreateLandscape();
                EditorUtility.DisplayProgressBar("Conquest", "Gerando personagem e elementos magicos...", .7f);
                CreatePlayer();
                CreateCrystals();
                CreateLightingAndCamera();
                CreateAtmosphere();
                EditorUtility.DisplayProgressBar("Conquest", "Salvando cena Unity...", .94f);

                PlayerSettings.colorSpace = ColorSpace.Linear;
                PlayerSettings.productName = "CONQUEST - Vale dos Conjuntos";
                PlayerSettings.companyName = "Projeto Nuvem";
                EditorSceneManager.MarkSceneDirty(scene);
                if (!EditorSceneManager.SaveScene(scene, ScenePath))
                    throw new InvalidOperationException("Unity nao confirmou o salvamento da cena.");
                EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();
                Debug.Log("CONQUEST: Cena URP gerada em " + ScenePath +
                          ". Entre em Play para explorar. Teste iluminacao, materiais e desempenho no Editor.");
                EditorUtility.DisplayDialog("Conquest",
                    "Cenario salvo em " + ScenePath + ". Pressione Play para testar WASD, Shift, camera e cristais. " +
                    "Nao e uma reproducao fiel do video original nem um build Windows validado.", "OK");
            }
            catch (Exception error)
            {
                Debug.LogException(error);
                EditorUtility.DisplayDialog("Erro ao gerar o Conquest", error.Message, "OK");
            }
            finally { EditorUtility.ClearProgressBar(); }
        }

        private static void EnsureFolder(string path)
        {
            string[] parts = path.Split('/');
            string current = parts[0];
            for (int i = 1; i < parts.Length; i++)
            {
                string child = current + "/" + parts[i];
                if (!AssetDatabase.IsValidFolder(child))
                    AssetDatabase.CreateFolder(current, parts[i]);
                current = child;
            }
        }

        private static Material CreateMaterial(string name, Color color, float metallic, float smoothness,
            Color? emission = null)
        {
            Shader shader = Shader.Find("Universal Render Pipeline/Lit");
            if (!shader) throw new InvalidOperationException("URP/Lit indisponivel: confira o Universal RP e o URP Asset.");
            Material m = new Material(shader);
            m.name = name;
            m.SetColor("_BaseColor", color);
            m.SetFloat("_Metallic", metallic);
            m.SetFloat("_Smoothness", smoothness);
            m.enableInstancing = true;
            if (emission.HasValue)
            {
                m.EnableKeyword("_EMISSION");
                m.SetColor("_EmissionColor", emission.Value);
            }
            AssetDatabase.CreateAsset(m, Generated + "/" + name + ".mat");
            Materials.Add(name, m);
            return m;
        }

        private static void SetupMaterials()
        {
            CreateMaterial("Stone", new Color(.50f, .52f, .50f), 0f, .21f);
            CreateMaterial("StoneDark", new Color(.28f, .31f, .34f), 0f, .18f);
            CreateMaterial("Plaster", new Color(.79f, .74f, .60f), 0f, .17f);
            CreateMaterial("Timber", new Color(.31f, .19f, .115f), 0f, .26f);
            CreateMaterial("Roof", new Color(.42f, .15f, .11f), .03f, .25f);
            CreateMaterial("Leaf", new Color(.115f, .26f, .17f), 0f, .25f);
            CreateMaterial("LeafBright", new Color(.19f, .34f, .21f), 0f, .22f);
            CreateMaterial("Trunk", new Color(.26f, .17f, .10f), 0f, .14f);
            CreateMaterial("Flowers", new Color(.91f, .64f, .34f), 0f, .27f);
            CreateMaterial("PlayerArmor", new Color(.19f, .31f, .39f), .55f, .58f);
            CreateMaterial("PlayerFabric", new Color(.24f, .16f, .25f), .02f, .32f);
            CreateMaterial("Skin", new Color(.64f, .46f, .32f), 0f, .35f);
            CreateMaterial("Metal", new Color(.55f, .48f, .32f), .72f, .67f);
            CreateMaterial("Water", new Color(.09f, .39f, .50f), .23f, .93f, new Color(.01f, .05f, .08f));
            CreateMaterial("CrystalBlue", new Color(.15f, .68f, .85f), .12f, .72f, new Color(.13f, .85f, 1.0f) * 3.1f);
            CreateMaterial("CrystalPurple", new Color(.59f, .27f, .90f), .10f, .70f, new Color(.70f, .23f, 1f) * 3f);
            CreateMaterial("CrystalGold", new Color(.93f, .69f, .18f), .12f, .64f, new Color(1f, .6f, .08f) * 3f);
            CreateMaterial("Lantern", new Color(1f, .65f, .25f), .05f, .35f, new Color(1.0f, .45f, .09f) * 2.6f);
            CreateMaterial("Glass", new Color(.12f, .26f, .34f), .16f, .88f);
            AddSurfaceDetailTextures();
        }


        /// <summary>
        /// Texturas PBR-albedo originais em vez de superficies totalmente planas.
        /// Tons/seams de madeira, pedra, telhas e reboco sao gerados deterministicamente
        /// e salvos como Texture2D assets editaveis.
        /// </summary>
        private static void AddSurfaceDetailTextures()
        {
            AttachTexture("Stone", "StoneDetail", new Color(.55f, .57f, .56f),
                new Color(.27f, .31f, .32f), 0, new Vector2(2.3f, 2.3f));
            AttachTexture("StoneDark", "OldStoneDetail", new Color(.40f, .43f, .43f),
                new Color(.22f, .24f, .25f), 0, new Vector2(2.1f, 2.1f));
            AttachTexture("Timber", "WoodDetail", new Color(.37f, .23f, .14f),
                new Color(.15f, .085f, .055f), 1, new Vector2(1.8f, 1.2f));
            AttachTexture("Roof", "RoofTilesDetail", new Color(.59f, .25f, .17f),
                new Color(.24f, .10f, .075f), 2, new Vector2(2.2f, 2.8f));
            AttachTexture("Plaster", "PlasterDetail", new Color(.83f, .78f, .65f),
                new Color(.52f, .47f, .38f), 3, new Vector2(2.0f, 2.0f));
            AttachTexture("Leaf", "ForestDetail", new Color(.19f, .39f, .24f),
                new Color(.07f, .17f, .11f), 3, new Vector2(1.0f, 1.0f));
        }

        private static void AttachTexture(string materialName, string textureName,
            Color light, Color dark, int pattern, Vector2 tiling)
        {
            const int size = 128;
            Texture2D texture = new Texture2D(size, size, TextureFormat.RGBA32, true);
            texture.name = textureName;
            texture.wrapMode = TextureWrapMode.Repeat;
            texture.filterMode = FilterMode.Trilinear;

            for (int y = 0; y < size; y++)
            for (int x = 0; x < size; x++)
            {
                float broad = Mathf.PerlinNoise((x + 16f) * .056f, (y + 37f) * .056f);
                float fine = Mathf.PerlinNoise((x + 7f) * .27f, (y + 17f) * .27f);
                float t = .25f + broad * .52f + fine * .23f;
                float seams = 1f;

                if (pattern == 0) // blocos de pedra + junta irregular
                {
                    int row = y / 26;
                    int shiftedX = (x + (row % 2) * 17) % 35;
                    if (shiftedX <= 1 || y % 26 <= 1) seams = .36f;
                }
                else if (pattern == 1) // veios longos de madeira
                {
                    float wave = Mathf.Sin((x + broad * 11f) * .55f);
                    t = Mathf.Clamp01(.25f + fine * .23f + .27f * (wave * .5f + .5f));
                }
                else if (pattern == 2) // telhas intercaladas
                {
                    int row = y / 17;
                    int shiftedX = (x + (row % 2) * 12) % 25;
                    if (shiftedX <= 1 || y % 17 <= 1) seams = .28f;
                    t += Mathf.Sin(y * .23f) * .11f;
                }
                else // reboco com granulação pequena
                {
                    t = .55f + (broad - .5f) * .26f + (fine - .5f) * .13f;
                }
                Color pixel = Color.Lerp(dark, light, Mathf.Clamp01(t * seams));
                texture.SetPixel(x, y, pixel);
            }

            texture.Apply(true, false);
            AssetDatabase.CreateAsset(texture, Generated + "/" + textureName + ".asset");
            Material material = Materials[materialName];
            material.SetTexture("_BaseMap", texture);
            material.SetTextureScale("_BaseMap", tiling);
            material.SetColor("_BaseColor", Color.white);
            EditorUtility.SetDirty(material);
        }

        private static void SetupMeshes()
        {
            coneMesh = new Mesh { name = "PineCone_Mesh" };
            List<Vector3> vertices = new List<Vector3>();
            List<int> triangles = new List<int>();
            const int sides = 12;
            for (int i = 0; i < sides; i++)
            {
                float angle = i * Mathf.PI * 2f / sides;
                float nextAngle = (i + 1) * Mathf.PI * 2f / sides;
                int start = vertices.Count;
                vertices.Add(new Vector3(Mathf.Cos(angle), 0f, Mathf.Sin(angle)));
                vertices.Add(new Vector3(0f, 1.9f, 0f));
                vertices.Add(new Vector3(Mathf.Cos(nextAngle), 0f, Mathf.Sin(nextAngle)));
                triangles.Add(start); triangles.Add(start + 1); triangles.Add(start + 2);
            }
            coneMesh.SetVertices(vertices);
            coneMesh.SetTriangles(triangles, 0);
            coneMesh.RecalculateNormals();
            coneMesh.RecalculateBounds();
            AssetDatabase.CreateAsset(coneMesh, Generated + "/PineCone.asset");

            crystalMesh = new Mesh { name = "Crystal_Diamond_Mesh" };
            var crystalVerts = new List<Vector3>();
            var crystalTris = new List<int>();
            const int facets = 6;
            for (int i = 0; i < facets; i++)
            {
                float a = i * Mathf.PI * 2f / facets;
                float b = (i + 1) * Mathf.PI * 2f / facets;
                int start = crystalVerts.Count;
                Vector3 v0 = new Vector3(Mathf.Cos(a) * .65f, 0f, Mathf.Sin(a) * .65f);
                Vector3 v1 = new Vector3(Mathf.Cos(b) * .65f, 0f, Mathf.Sin(b) * .65f);
                crystalVerts.Add(v0); crystalVerts.Add(new Vector3(0, 1.25f, 0)); crystalVerts.Add(v1);
                crystalTris.Add(start); crystalTris.Add(start + 1); crystalTris.Add(start + 2);
                start = crystalVerts.Count;
                crystalVerts.Add(v1); crystalVerts.Add(new Vector3(0, -.94f, 0)); crystalVerts.Add(v0);
                crystalTris.Add(start); crystalTris.Add(start + 1); crystalTris.Add(start + 2);
            }
            crystalMesh.SetVertices(crystalVerts);
            crystalMesh.SetTriangles(crystalTris, 0);
            crystalMesh.RecalculateNormals();
            crystalMesh.RecalculateBounds();
            AssetDatabase.CreateAsset(crystalMesh, Generated + "/CrystalMesh.asset");
        }

        private static Texture2D MakeGroundTexture(string name, Color main, Color dark, float frequency)
        {
            const int textureSize = 128;
            Texture2D tex = new Texture2D(textureSize, textureSize, TextureFormat.RGBA32, true);
            tex.name = name;
            tex.wrapMode = TextureWrapMode.Repeat;
            tex.filterMode = FilterMode.Trilinear;
            for (int y = 0; y < textureSize; y++)
            for (int x = 0; x < textureSize; x++)
            {
                float u = x / (float)textureSize;
                float v = y / (float)textureSize;
                float broad = Mathf.PerlinNoise(u * frequency + 11f, v * frequency + 47f);
                float fine = Mathf.PerlinNoise(u * frequency * 5f + 3f, v * frequency * 5f + 9f);
                float blend = Mathf.Clamp01(.20f + broad * .55f + fine * .25f);
                tex.SetPixel(x, y, Color.Lerp(dark, main, blend));
            }
            tex.Apply(true, false);
            AssetDatabase.CreateAsset(tex, Generated + "/" + name + ".asset");
            return tex;
        }

        private static TerrainLayer MakeTerrainLayer(string name, Texture2D texture, float tile, float smoothness)
        {
            TerrainLayer layer = new TerrainLayer
            {
                diffuseTexture = texture,
                tileSize = new Vector2(tile, tile),
                metallic = 0f,
                smoothness = smoothness
            };
            AssetDatabase.CreateAsset(layer, Generated + "/" + name + ".terrainlayer");
            return layer;
        }

        private static float HeightAt(float x, float z)
        {
            // Planalto central para a vila; montanhas gradualmente mais altas no horizonte.
            float r = Mathf.Sqrt(x * x + z * z) / 130f;
            float hills = Mathf.Pow(Mathf.Clamp01((r - .27f) / .7f), 1.6f);
            float noise = Mathf.PerlinNoise((x + 347f) * .017f, (z + 515f) * .017f);
            float detail = Mathf.PerlinNoise((x + 12f) * .075f, (z + 42f) * .075f) - .5f;
            return Mathf.Clamp(5.8f + hills * (7f + noise * 11f) + detail * 2.5f * hills, 0.5f, 29f);
        }

        private static float Ground(float x, float z) =>
            terrain.SampleHeight(new Vector3(x, 0, z)) + terrain.transform.position.y;

        private static void CreateTerrain()
        {
            TerrainData data = new TerrainData
            {
                heightmapResolution = TerrainResolution,
                alphamapResolution = 256,
                baseMapResolution = 512,
                size = new Vector3(TerrainWidth, 32f, TerrainWidth)
            };
            float[,] heights = new float[TerrainResolution, TerrainResolution];
            for (int z = 0; z < TerrainResolution; z++)
            for (int x = 0; x < TerrainResolution; x++)
            {
                float worldX = x / (float)(TerrainResolution - 1) * TerrainWidth - TerrainWidth / 2f;
                float worldZ = z / (float)(TerrainResolution - 1) * TerrainWidth - TerrainWidth / 2f;
                heights[z, x] = HeightAt(worldX, worldZ) / 32f;
            }
            data.SetHeights(0, 0, heights);
            AssetDatabase.CreateAsset(data, Generated + "/TerrainData.asset");

            var grass = MakeGroundTexture("Grass_Albedo", new Color(.29f, .39f, .21f),
                new Color(.12f, .22f, .12f), 9f);
            var earth = MakeGroundTexture("Earth_Albedo", new Color(.43f, .32f, .21f),
                new Color(.24f, .18f, .12f), 11f);
            var rock = MakeGroundTexture("Rock_Albedo", new Color(.49f, .49f, .46f),
                new Color(.29f, .33f, .34f), 13f);

            data.terrainLayers = new[] {
                MakeTerrainLayer("Grass_Layer", grass, 10f, .10f),
                MakeTerrainLayer("Earth_Layer", earth, 8f, .11f),
                MakeTerrainLayer("Rock_Layer", rock, 12f, .16f)
            };

            const int alphaSize = 256;
            float[,,] maps = new float[alphaSize, alphaSize, 3];
            for (int z = 0; z < alphaSize; z++)
            for (int x = 0; x < alphaSize; x++)
            {
                float wx = x / (float)(alphaSize - 1) * TerrainWidth - TerrainWidth / 2f;
                float wz = z / (float)(alphaSize - 1) * TerrainWidth - TerrainWidth / 2f;
                float road = Mathf.Clamp01((7f - Mathf.Abs(wx)) / 3.4f) *
                             Mathf.Clamp01((105f - Mathf.Abs(wz)) / 8f);
                float plaza = Mathf.Clamp01((17f - Mathf.Sqrt(wx * wx + wz * wz)) / 4f);
                float crossRoad = Mathf.Clamp01((5f - Mathf.Abs(wz - 19f)) / 3f) *
                                  Mathf.Clamp01((58f - Mathf.Abs(wx)) / 8f);
                float incline = data.GetSteepness(x / 255f, z / 255f);
                float stone = Mathf.Clamp01((incline - 14f) / 29f);
                float dirt = Mathf.Clamp01(Mathf.Max(road, plaza * .68f, crossRoad * .9f));
                float green = (1f - dirt) * (1f - stone);
                float total = green + dirt + stone + .0001f;
                maps[z, x, 0] = green / total;
                maps[z, x, 1] = dirt / total;
                maps[z, x, 2] = stone / total;
            }
            data.SetAlphamaps(0, 0, maps);

            GameObject terrainObject = Terrain.CreateTerrainGameObject(data);
            terrainObject.name = "Terrain | relevo e 3 materiais PBR";
            terrainObject.transform.position = new Vector3(-TerrainWidth / 2f, 0f, -TerrainWidth / 2f);
            terrainObject.transform.parent = root;
            terrain = terrainObject.GetComponent<Terrain>();
            terrain.drawInstanced = true;
            terrain.heightmapPixelError = 5f;
        }

        private static GameObject Part(string name, PrimitiveType primitive, Transform parent,
            Vector3 localPosition, Vector3 localScale, string material, bool collision = true)
        {
            GameObject obj = GameObject.CreatePrimitive(primitive);
            obj.name = name;
            obj.transform.SetParent(parent, false);
            obj.transform.localPosition = localPosition;
            obj.transform.localScale = localScale;
            obj.GetComponent<Renderer>().sharedMaterial = Materials[material];
            if (!collision)
            {
                Collider col = obj.GetComponent<Collider>();
                if (col) UnityEngine.Object.DestroyImmediate(col);
            }
            return obj;
        }

        private static GameObject CustomPart(string name, Mesh mesh, Transform parent,
            Vector3 localPosition, Vector3 scale, string material)
        {
            GameObject obj = new GameObject(name);
            obj.transform.SetParent(parent, false);
            obj.transform.localPosition = localPosition;
            obj.transform.localScale = scale;
            obj.AddComponent<MeshFilter>().sharedMesh = mesh;
            obj.AddComponent<MeshRenderer>().sharedMaterial = Materials[material];
            return obj;
        }

        private static Transform NewGroup(string name, Vector3 position, Transform parent = null)
        {
            GameObject obj = new GameObject(name);
            obj.transform.SetParent(parent ? parent : root, false);
            obj.transform.position = position;
            return obj.transform;
        }

        private static void CreateVillage()
        {
            Transform village = NewGroup("Vila e arquitetura", Vector3.zero);
            Part("Praca circular", PrimitiveType.Cylinder, village,
                new Vector3(0, Ground(0, 0) + .08f, 0), new Vector3(12f, .11f, 12f), "Stone");
            CreateFountain(village);

            for (int i = 0; i < 12; i++)
            {
                float theta = i * Mathf.PI * 2f / 12f;
                float radius = i % 2 == 0 ? 29f : 38f;
                float x = Mathf.Cos(theta) * radius;
                float z = Mathf.Sin(theta) * radius;
                if (Mathf.Abs(x) < 10f) x += x >= 0 ? 10f : -10f;
                CreateCottage(village, i, x, z, theta);
            }
            for (int i = -8; i <= 8; i++)
            {
                float z = i * 9f;
                if (Mathf.Abs(z) < 22f) continue;
                float y = Ground(-5, z);
                Part("Pedra estrada " + i, PrimitiveType.Cube, village,
                    new Vector3(-5f, y + .04f, z), new Vector3(.18f, .08f, 3f), "StoneDark", false);
            }
            CreateCastle(village);
        }

        private static void CreateCottage(Transform parent, int id, float x, float z, float theta)
        {
            Transform house = NewGroup("Casa medieval " + id, new Vector3(x, Ground(x, z), z), parent);
            house.rotation = Quaternion.Euler(0, -theta * Mathf.Rad2Deg + 90f, 0);
            float width = 6f + (id % 3) * 1.3f;
            float depth = 6.6f;
            Part("Alicerces", PrimitiveType.Cube, house, new Vector3(0, .25f, 0),
                new Vector3(width + .6f, .5f, depth + .6f), "Stone");
            Part("Paredes reboco", PrimitiveType.Cube, house, new Vector3(0, 2f, 0),
                new Vector3(width, 3.7f, depth), "Plaster");
            Part("Viga frontal", PrimitiveType.Cube, house,
                new Vector3(0, 2.1f, -depth / 2f - .06f), new Vector3(.28f, 3.8f, .26f), "Timber", false);
            for (int side = -1; side <= 1; side += 2)
            {
                Part("Pilar", PrimitiveType.Cube, house,
                    new Vector3(side * (width / 2f - .1f), 2.15f, -depth / 2f - .05f),
                    new Vector3(.35f, 4.0f, .35f), "Timber", false);
                Part("Agua do telhado", PrimitiveType.Cube, house,
                    new Vector3(side * width * .24f, 4.45f, 0),
                    new Vector3(width * .62f, .3f, depth + 1.2f), "Roof", false)
                    .transform.localRotation = Quaternion.Euler(0, 0, side * 31f);
                Part("Janela moldura", PrimitiveType.Cube, house,
                    new Vector3(side * width * .31f, 2.3f, -depth / 2f - .18f),
                    new Vector3(1.12f, 1.25f, .18f), "Timber", false);
                Part("Janela vidro", PrimitiveType.Cube, house,
                    new Vector3(side * width * .31f, 2.3f, -depth / 2f - .3f),
                    new Vector3(.8f, .92f, .09f), "Glass", false);
            }
            Part("Porta", PrimitiveType.Cube, house,
                new Vector3(0, 1.15f, -depth / 2f - .17f), new Vector3(1.65f, 2.35f, .16f),
                "Timber", false);
            Part("Maca", PrimitiveType.Sphere, house,
                new Vector3(0.5f, 2.1f, -depth / 2f - .31f), new Vector3(.12f, .12f, .11f),
                "Metal", false);
            Part("Chamine", PrimitiveType.Cube, house,
                new Vector3(-width * .28f, 5.7f, 1.5f), new Vector3(.9f, 2.7f, .9f),
                "StoneDark", false);
            Part("Lanterna", PrimitiveType.Sphere, house,
                new Vector3(width * .4f, 2.5f, -depth / 2f - .65f),
                new Vector3(.22f, .30f, .22f), "Lantern", false);

            if (id < 4)
            {
                GameObject lightObject = new GameObject("Luz quente da casa");
                lightObject.transform.SetParent(house, false);
                lightObject.transform.localPosition = new Vector3(width * .4f, 2.5f, -depth / 2f - .7f);
                Light light = lightObject.AddComponent<Light>();
                light.type = LightType.Point;
                light.color = new Color(1f, .55f, .27f);
                light.range = 7f;
                light.intensity = 1.25f;
                light.shadows = LightShadows.None;
            }
        }

        private static void CreateFountain(Transform parent)
        {
            float y = Ground(0, 0);
            Transform fountain = NewGroup("Fonte central", new Vector3(0, y, 0), parent);
            Part("Bacia pedras", PrimitiveType.Cylinder, fountain,
                new Vector3(0, .35f, 0), new Vector3(3.7f, .36f, 3.7f), "Stone");
            Part("Borda pedra", PrimitiveType.Cylinder, fountain,
                new Vector3(0, .75f, 0), new Vector3(3.3f, .17f, 3.3f), "StoneDark");
            Part("Agua refletiva", PrimitiveType.Cylinder, fountain,
                new Vector3(0, .93f, 0), new Vector3(2.92f, .05f, 2.92f), "Water", false);
            Part("Coluna", PrimitiveType.Cylinder, fountain,
                new Vector3(0, 1.65f, 0), new Vector3(.6f, 1.3f, .6f), "Stone");
            Part("Ponta metal", PrimitiveType.Sphere, fountain,
                new Vector3(0, 3.05f, 0), new Vector3(.6f, .6f, .6f), "Metal", false);
            Shader particleShader = Shader.Find("Universal Render Pipeline/Particles/Unlit");
            if (!particleShader) throw new InvalidOperationException("Shader URP de particulas indisponivel.");
            Material dropletMaterial = new Material(particleShader);
            dropletMaterial.name = "Particles_Water";
            dropletMaterial.SetColor("_BaseColor", new Color(.48f, .85f, 1f, .65f));
            AssetDatabase.CreateAsset(dropletMaterial, Generated + "/Particles_Water.mat");

            var particles = new GameObject("Gotas de agua").AddComponent<ParticleSystem>();
            particles.GetComponent<ParticleSystemRenderer>().sharedMaterial = dropletMaterial;
            particles.transform.SetParent(fountain, false);
            particles.transform.localPosition = new Vector3(0, 2.6f, 0);
            var main = particles.main;
            main.startLifetime = 1.4f;
            main.startSpeed = 1.1f;
            main.startSize = .08f;
            main.maxParticles = 160;
            main.startColor = new Color(.6f, .9f, 1f, .75f);
            var emission = particles.emission; emission.rateOverTime = 40f;
            var shape = particles.shape;
            shape.shapeType = ParticleSystemShapeType.Cone;
            shape.angle = 35f;
            shape.radius = .35f;
        }

        private static void CreateCastle(Transform parent)
        {
            const float x = 0, z = 88;
            Transform castle = NewGroup("Fortaleza de Cael (cenario)", new Vector3(x, Ground(x, z), z), parent);
            Part("Portao muralha", PrimitiveType.Cube, castle,
                new Vector3(0, 4f, 0), new Vector3(23f, 8f, 6f), "StoneDark");
            Part("Entrada macica", PrimitiveType.Cube, castle,
                new Vector3(0, 3.2f, -3.08f), new Vector3(4.8f, 6.4f, .35f), "Timber", false);
            for (int side = -1; side <= 1; side += 2)
            {
                float tx = side * 12f;
                Part("Torre lateral", PrimitiveType.Cylinder, castle,
                    new Vector3(tx, 5.2f, 0), new Vector3(7f, 5.1f, 7f), "Stone");
                CustomPart("Cobertura torre", coneMesh, castle,
                    new Vector3(tx, 10.35f, 0), new Vector3(4.3f, 4f, 4.3f), "Roof");
            }
            for (int i = -7; i <= 7; i++)
            {
                if (i == 0) continue;
                Part("Merla " + i, PrimitiveType.Cube, castle,
                    new Vector3(i * 1.5f, 8.6f, -2.7f),
                    new Vector3(.85f, 1.4f, .9f), "Stone");
            }
        }

        private static void CreateLandscape()
        {
            Transform nature = NewGroup("Natureza e vegetacao", Vector3.zero);
            for (int i = 0; i < 125; i++)
            {
                float x = Range(-115f, 115f);
                float z = Range(-115f, 115f);
                float radius = Mathf.Sqrt(x * x + z * z);
                if (radius < 43f || Mathf.Abs(x) < 10f && Mathf.Abs(z) < 107f || radius > 118f)
                    continue;
                CreateTree(nature, i, x, z);
            }
            for (int i = 0; i < 180; i++)
            {
                float x = Range(-112f, 112f), z = Range(-112f, 112f);
                if (Mathf.Abs(x) < 7f && Mathf.Abs(z) < 95f) continue;
                float scale = Range(.25f, 1.7f);
                GameObject stone = Part("Rocha natural " + i, PrimitiveType.Sphere, nature,
                    new Vector3(x, Ground(x, z) + .12f, z),
                    new Vector3(scale * 1.5f, scale * .7f, scale), "Stone", false);
                stone.transform.rotation = UnityEngine.Random.rotation;
            }
            for (int i = 0; i < 280; i++)
            {
                float x = Range(-70f, 70f), z = Range(-70f, 70f);
                if (Mathf.Abs(x) < 8f || Mathf.Sqrt(x * x + z * z) < 15f) continue;
                float h = Ground(x, z);
                Part("Arbusto " + i, PrimitiveType.Sphere, nature,
                    new Vector3(x, h + .35f, z),
                    new Vector3(Range(.4f, .85f), Range(.4f, .7f), Range(.4f, .85f)),
                    i % 3 == 0 ? "LeafBright" : "Leaf", false);
                if (i % 8 == 0)
                    Part("Flor " + i, PrimitiveType.Sphere, nature,
                        new Vector3(x + .6f, h + .4f, z),
                        new Vector3(.18f, .18f, .18f), "Flowers", false);
            }
        }

        private static void CreateTree(Transform parent, int index, float x, float z)
        {
            float height = Range(4.2f, 9.6f);
            Transform tree = NewGroup("Pinheiro " + index, new Vector3(x, Ground(x, z), z), parent);
            Part("Tronco", PrimitiveType.Cylinder, tree,
                new Vector3(0, height * .22f, 0), new Vector3(.36f, height * .30f, .36f),
                "Trunk", false);
            for (int i = 0; i < 3; i++)
            {
                float y = height * (.34f + i * .19f);
                float radius = (1.9f - i * .45f) * (height / 7f);
                CustomPart("Copa", coneMesh, tree,
                    new Vector3(0, y, 0), new Vector3(radius, height * .30f, radius),
                    i % 2 == 0 ? "Leaf" : "LeafBright");
            }
        }

        private static float Range(float min, float max) =>
            min + (float)random.NextDouble() * (max - min);

        private static void CreatePlayer()
        {
            const float x = 0f, z = -24f;
            Transform player = NewGroup("Player - explorador", new Vector3(x, Ground(x, z) + .15f, z));
            player.gameObject.layer = 2; // Ignore Raycast: camera nao colide com o jogador.
            CharacterController collision = player.gameObject.AddComponent<CharacterController>();
            collision.center = new Vector3(0f, 1f, 0f);
            collision.height = 2.0f;
            collision.radius = .36f;
            collision.stepOffset = .30f;
            collision.slopeLimit = 45f;

            Transform visual = NewGroup("Visual temporario (trocar por modelo Humanoid)", Vector3.zero, player);
            visual.localPosition = Vector3.zero;
            Part("Torso armadura", PrimitiveType.Capsule, visual,
                new Vector3(0, 1.25f, 0), new Vector3(.70f, .65f, .4f), "PlayerArmor", false);
            Part("Cabeca", PrimitiveType.Sphere, visual,
                new Vector3(0, 2.12f, 0), new Vector3(.43f, .51f, .43f), "Skin", false);
            Part("Capuz", PrimitiveType.Sphere, visual,
                new Vector3(0, 2.34f, .10f), new Vector3(.47f, .32f, .44f), "PlayerFabric", false);
            Transform leftArm = NewGroup("Braco E", Vector3.zero, visual);
            leftArm.localPosition = new Vector3(-.47f, 1.68f, 0);
            Part("Manga E", PrimitiveType.Capsule, leftArm,
                new Vector3(0, -.33f, 0), new Vector3(.25f, .43f, .25f), "PlayerFabric", false);
            Transform rightArm = NewGroup("Braco D", Vector3.zero, visual);
            rightArm.localPosition = new Vector3(.47f, 1.68f, 0);
            Part("Manga D", PrimitiveType.Capsule, rightArm,
                new Vector3(0, -.33f, 0), new Vector3(.25f, .43f, .25f), "PlayerFabric", false);
            Transform leftLeg = NewGroup("Perna E", Vector3.zero, visual);
            leftLeg.localPosition = new Vector3(-.2f, .85f, 0);
            Part("Bota E", PrimitiveType.Capsule, leftLeg,
                new Vector3(0, -.36f, 0), new Vector3(.27f, .45f, .28f), "StoneDark", false);
            Transform rightLeg = NewGroup("Perna D", Vector3.zero, visual);
            rightLeg.localPosition = new Vector3(.2f, .85f, 0);
            Part("Bota D", PrimitiveType.Capsule, rightLeg,
                new Vector3(0, -.36f, 0), new Vector3(.27f, .45f, .28f), "StoneDark", false);

            // O MeshGenerator dos primitives cria colliders; visual removido acima.
            foreach (Transform child in player.GetComponentsInChildren<Transform>())
                child.gameObject.layer = 2;
            ConquestCharacterMotor movement = player.gameObject.AddComponent<ConquestCharacterMotor>();
            movement.leftArm = leftArm; movement.rightArm = rightArm;
            movement.leftLeg = leftLeg; movement.rightLeg = rightLeg;
            root.gameObject.AddComponent<ConquestDemoHUD>();
        }

        private static void CreateCrystals()
        {
            Vector3[] locations = {
                new Vector3(19f, 0f, -10f), new Vector3(-25f, 0f, 19f), new Vector3(9f, 0f, 54f)
            };
            string[] materials = { "CrystalBlue", "CrystalPurple", "CrystalGold" };
            for (int i = 0; i < locations.Length; i++)
            {
                Vector3 spot = locations[i];
                Transform group = NewGroup("Cristal " + (i + 1),
                    new Vector3(spot.x, Ground(spot.x, spot.z) + .6f, spot.z));
                Part("Pedestal", PrimitiveType.Cylinder, group,
                    new Vector3(0, .06f, 0), new Vector3(1.1f, .23f, 1.1f), "StoneDark");
                Transform visual = NewGroup("Visual flutuante", Vector3.zero, group);
                visual.localPosition = new Vector3(0, 1.3f, 0);
                CustomPart("Gema facetada", crystalMesh, visual, Vector3.zero,
                    new Vector3(1.15f, 1.15f, 1.15f), materials[i]);
                GameObject lightObject = new GameObject("Brilho do cristal");
                lightObject.transform.SetParent(group, false);
                lightObject.transform.localPosition = new Vector3(0, 2.1f, 0);
                Light light = lightObject.AddComponent<Light>();
                light.type = LightType.Point;
                light.range = 9f;
                light.intensity = 2.1f;
                light.color = i == 0 ? Color.cyan :
                    i == 1 ? new Color(.66f, .35f, 1f) : new Color(1f, .68f, .22f);
                light.shadows = LightShadows.None;

                SphereCollider trigger = group.gameObject.AddComponent<SphereCollider>();
                trigger.isTrigger = true;
                trigger.radius = 1.6f;
                ConquestCrystal crystal = group.gameObject.AddComponent<ConquestCrystal>();
                crystal.crystalName = "Cristal " + (i + 1);
                crystal.visual = visual;
                crystal.glow = light;
            }
        }

        private static void CreateLightingAndCamera()
        {
            GameObject lightObject = new GameObject("Sun - sombras suaves");
            lightObject.transform.SetParent(root, false);
            lightObject.transform.rotation = Quaternion.Euler(48f, -35f, 0f);
            Light sun = lightObject.AddComponent<Light>();
            sun.type = LightType.Directional;
            sun.color = new Color(1f, .87f, .71f);
            sun.intensity = 1.45f;
            sun.shadows = LightShadows.Soft;
            sun.shadowStrength = .79f;
            RenderSettings.sun = sun;
            QualitySettings.shadowDistance = 100f;

            RenderSettings.ambientMode = AmbientMode.Flat;
            RenderSettings.ambientLight = new Color(.42f, .51f, .59f);
            RenderSettings.fog = true;
            RenderSettings.fogMode = FogMode.ExponentialSquared;
            RenderSettings.fogDensity = .006f;
            RenderSettings.fogColor = new Color(.53f, .67f, .73f);

            GameObject cameraObject = new GameObject("Main Camera - third person");
            cameraObject.tag = "MainCamera";
            cameraObject.transform.SetParent(root, false);
            cameraObject.transform.position = new Vector3(0f, Ground(0, -24) + 5.5f, -32f);
            Camera camera = cameraObject.AddComponent<Camera>();
            camera.clearFlags = CameraClearFlags.Skybox;
            camera.fieldOfView = 64f;
            camera.farClipPlane = 510f;
            camera.allowHDR = true;
            cameraObject.AddComponent<AudioListener>();
            UniversalAdditionalCameraData cameraData = cameraObject.AddComponent<UniversalAdditionalCameraData>();
            cameraData.renderPostProcessing = true;

            ConquestCameraRig rig = cameraObject.AddComponent<ConquestCameraRig>();
            GameObject player = GameObject.Find("Player - explorador");
            if (!player) throw new InvalidOperationException("Personagem nao encontrado.");
            rig.target = player.transform;
        }

        private static void CreateAtmosphere()
        {
            VolumeProfile profile = ScriptableObject.CreateInstance<VolumeProfile>();
            profile.name = "Conquest_URP_PostProcessing";
            AssetDatabase.CreateAsset(profile, Generated + "/PostProcessing.asset");

            Bloom bloom = profile.Add<Bloom>(true);
            bloom.intensity.Override(.33f);
            bloom.threshold.Override(1.25f);
            bloom.scatter.Override(.66f);

            Tonemapping tone = profile.Add<Tonemapping>(true);
            tone.mode.Override(TonemappingMode.ACES);

            ColorAdjustments color = profile.Add<ColorAdjustments>(true);
            color.postExposure.Override(.05f);
            color.contrast.Override(9f);
            color.saturation.Override(-2f);

            Vignette vignette = profile.Add<Vignette>(true);
            vignette.intensity.Override(.14f);
            vignette.smoothness.Override(.42f);

            GameObject volumeObject = new GameObject("URP - Color Grade / Bloom / ACES");
            volumeObject.transform.SetParent(root, false);
            Volume volume = volumeObject.AddComponent<Volume>();
            volume.isGlobal = true;
            volume.priority = 1f;
            volume.sharedProfile = profile;
        }
    }
}
#endif
