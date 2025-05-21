pipeline { 
   agent any 
   environment { 
      DOCKER_HUB_CREDENTIALS = credentials('dockerhub_credentials')
      DOCKER_IMAGE = 'miko3535/teedy-app'
      DOCKER_TAG = "${env.BUILD_NUMBER}" // use build number as tag 
   } 
   stages {
      stage('Build') { 
            steps { 
               checkout scmGit( 
                  branches: [[name: '*/master']],  
                  extensions: [],  
                  userRemoteConfigs: [[url: 'https://github.com/Cirnokyuu/Teedy.git']] 
               ) 
               sh 'mvn -B -DskipTests clean package' 
            } 
      } 
      stage('Building image') { 
         steps { 
               script { 
                  docker.build("${env.DOCKER_IMAGE}:${env.DOCKER_TAG}") 
               } 
         } 
      } 
      stage('Upload image') { 
         steps { 
            script { 
               docker.withRegistry('https://registry.hub.docker.com', 'dockerhub_credentials') { 
               // push image 
                  docker.image("${env.DOCKER_IMAGE}:${env.DOCKER_TAG}").push() 
               // ：optional: label latest 
               // docker.image("${env.DOCKER_IMAGE}:${env.DOCKER_TAG}").push('latest') 
               }
            } 
         }
      } 
// Running Docker container 
      stage('Run containers') {
         steps { 
            script { 
               // stop then remove containers if exists 
               sh 'docker stop teedy-container-8081 || true' 
               sh 'docker rm teedy-container-8081 || true' 
               // run Container 
               docker.image("${env.DOCKER_IMAGE}:${env.DOCKER_TAG}").run( 
               '--name teedy-container-8081 -d -p 8081:8080' 
               ) 
               // Optional: list all teedy-containers 
               sh 'docker ps --filter "name=teedy-container"' 
            }
         }
      } 
   } 
} 