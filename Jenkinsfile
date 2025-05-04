pipeline {
  agent any

  // 1️⃣ On désactive le checkout léger automatique
  options {
    skipDefaultCheckout()
  }

  environment {
    DOCKERHUB_CREDS  = 'docker-hub-creds'
    DOCKERHUB_ORG    = 'aziztesteur95100'
    IMAGE_API        = "${DOCKERHUB_ORG}/mon-troisieme-projet-docker-api"
    IMAGE_WEB        = "${DOCKERHUB_ORG}/mon-troisieme-projet-docker-web"
    IMAGE_TEST       = "${DOCKERHUB_ORG}/mon-troisieme-projet-docker-test"
    TAG              = "${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        // 2️⃣ Clone complet du repo (inclut .git)
        checkout scm
      }
    }

    stage('Build images in parallel') {
      parallel {
        stage('Build API') {
          steps {
            sh "docker build -t ${IMAGE_API}:${TAG} -f service-api/Dockerfile service-api"
          }
        }
        stage('Build Web') {
          steps {
            sh "docker build -t ${IMAGE_WEB}:${TAG} -f service-web/Dockerfile service-web"
          }
        }
        stage('Build Test') {
          steps {
            sh "docker build -t ${IMAGE_TEST}:${TAG} -f service-test/Dockerfile service-test"
          }
        }
      }
    }

    stage('Start services for testing') {
      steps {
        sh 'docker-compose up -d api web'
      }
    }

    stage('Tests (parallel)') {
      parallel {
        stage('K6') {
          steps {
            sh "docker run --rm --network=mon-troisieme-projet-docker_default ${IMAGE_TEST}:${TAG}"
          }
        }
        stage('Cypress') {
          steps {
            sh """
              docker run --rm \\
                --network=mon-troisieme-projet-docker_default \\
                -v "\$PWD/service-web:/e2e" \\
                cypress/included:12.17.4 \\
                --config baseUrl=http://web:80 \\
                --spec "/e2e/**/*"
            """
          }
        }
        stage('Newman') {
          steps {
            sh """
              docker run --rm \\
                --network=mon-troisieme-projet-docker_default \\
                -v "\$PWD/service-api:/etc/newman" \\
                postman/newman:alpine \\
                run /etc/newman/MOCK_AZIZ_SERVEUR.postman_collection.json \\
                --reporters cli,html \\
                --reporter-html-export reports/newman/newman-report.html
            """
          }
        }
      }
    }

    stage('Stop services') {
      steps {
        sh 'docker-compose down'
      }
    }

    stage('Push to enfin Docker Hub') {
      steps {
        withDockerRegistry([ credentialsId: DOCKERHUB_CREDS, url: '' ]) {
          sh """
            for IMG in ${IMAGE_API} ${IMAGE_WEB} ${IMAGE_TEST}; do
              docker push \$IMG:${TAG}
              docker tag \$IMG:${TAG} \$IMG:latest
              docker push \$IMG:latest
            done
          """
        }
      }
    }
  }

  post {
    always {
      echo "Build #${BUILD_NUMBER} terminé."
    }
  }
}
