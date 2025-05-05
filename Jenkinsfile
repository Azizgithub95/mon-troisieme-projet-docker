pipeline {
  agent any

  environment {
    DOCKERHUB_CREDS  = 'docker-hub-creds'
    DOCKERHUB_ORG    = 'aziztesteur95100'
    IMAGE_API        = "${DOCKERHUB_ORG}/mon-troisieme-projet-docker-api"
    IMAGE_WEB        = "${DOCKERHUB_ORG}/mon-troisieme-projet-docker-web"
    IMAGE_TEST       = "${DOCKERHUB_ORG}/mon-troisieme-projet-docker-test"
    TAG              = "${BUILD_NUMBER}"
  }

  stages {
    stage('Build Images') {
      parallel {
        stage('API') {
          steps {
            sh "docker build -t ${IMAGE_API}:${TAG} -f service-api/Dockerfile service-api"
          }
        }
        stage('Web') {
          steps {
            sh "docker build -t ${IMAGE_WEB}:${TAG} -f service-web/Dockerfile service-web"
          }
        }
        stage('Test Image') {
          steps {
            sh "docker build -t ${IMAGE_TEST}:${TAG} -f service-test/Dockerfile service-test"
          }
        }
      }
    }

    stage('Run Services') {
      steps {
        sh 'docker-compose up -d api web'
      }
    }

    stage('Execute Tests in Parallel') {
      parallel {
        stage('K6 Load') {
          steps {
            sh "docker run --rm --network=${JOB_NAME}_default ${IMAGE_TEST}:${TAG}"
          }
        }
        stage('Cypress E2E') {
          steps {
            sh '''
              docker run --rm \
                --network=${JOB_NAME}_default \
                -v "$PWD/tests/cypress:/e2e" \
                cypress/included:12.17.4 \
                --config baseUrl=http://web:80 \
                --spec "/e2e/integration/**/*"
            '''
          }
        }
        stage('Newman API') {
          steps {
            sh '''
              docker run --rm \
                --network=${JOB_NAME}_default \
                -v "$PWD/tests/newman:/etc/newman" \
                postman/newman:alpine \
                run /etc/newman/MOCK_AZIZ_SERVEUR.postman_collection.json \
                --reporters cli,html \
                --reporter-html-export reports/newman/newman-report.html
            '''
          }
        }
      }
    }

    stage('Teardown') {
      steps {
        sh 'docker-compose down'
      }
    }

    stage('Push to Docker Hub') {
      steps {
        withDockerRegistry([credentialsId: DOCKERHUB_CREDS, url: '']) {
          sh '''
            for IMG in ${IMAGE_API} ${IMAGE_WEB} ${IMAGE_TEST}; do
              docker push $IMG:${TAG}
              docker tag $IMG:${TAG} $IMG:latest
              docker push $IMG:latest
            done
          '''
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
