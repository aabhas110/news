pipeline {
  agent any

  environment {
    CI = 'true'
    AI_DISABLED = 'true'
    NEXT_TELEMETRY_DISABLED = '1'

    NEXTAUTH_SECRET = 'jenkins-test-secret'
    NEXTAUTH_URL = 'http://localhost:3000'
    CRON_SECRET = 'jenkins-cron-secret'
    DATABASE_URL = 'postgresql://newsforge:newsforge@localhost:5432/newsforge_ci?schema=public'

    IMAGE_NAME = "newsforge:${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/aabhas110/news.git'
      }
    }

    stage('Check Workspace Files') {
      steps {
        sh '''
          echo "Running repository Jenkinsfile with project-directory detection enabled."
          echo "Workspace:"
          pwd
          echo "Top-level files:"
          ls -la
          echo "package.json locations:"
          find . -maxdepth 5 -name package.json -print
        '''
      }
    }

    stage('Resolve Project Directory') {
      steps {
        script {
          env.PROJECT_DIR = sh(
            returnStdout: true,
            script: '''
              if [ -f package.json ]; then
                pwd
              else
                PACKAGE_FILE="$(find . -maxdepth 5 -name package.json -print | head -n 1)"
                if [ -z "$PACKAGE_FILE" ]; then
                  echo "ERROR: package.json not found in Jenkins workspace" >&2
                  exit 1
                fi
                cd "$(dirname "$PACKAGE_FILE")"
                pwd
              fi
            '''
          ).trim()
          echo "Resolved project directory: ${env.PROJECT_DIR}"
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        sh '''
          echo "Using PROJECT_DIR=$PROJECT_DIR"
          test -f "$PROJECT_DIR/package.json"
          docker run --rm \
            -v "$PROJECT_DIR":/app \
            -w /app \
            -e CI=true \
            -e AI_DISABLED=true \
            node:20-alpine \
            sh -lc "node --version && npm --version && if [ -f package-lock.json ]; then npm ci; else npm install; fi"
        '''
      }
    }

    stage('Environment Check') {
      steps {
        sh '''
          docker run --rm \
            -v "$PROJECT_DIR":/app \
            -w /app \
            node:20-alpine \
            sh -lc "node --version && npm --version && npx prisma --version && test ! -f .env"
        '''
      }
    }

    stage('Prisma Generate') {
      steps {
        sh '''
          docker run --rm \
            -v "$PROJECT_DIR":/app \
            -w /app \
            -e DATABASE_URL="$DATABASE_URL" \
            node:20-alpine \
            sh -lc "npx prisma generate"
        '''
      }
    }

    stage('Lint') {
      steps {
        sh '''
          docker run --rm \
            -v "$PROJECT_DIR":/app \
            -w /app \
            -e CI=true \
            node:20-alpine \
            sh -lc "npm run lint"
        '''
      }
    }

    stage('Type Check') {
      steps {
        sh '''
          docker run --rm \
            -v "$PROJECT_DIR":/app \
            -w /app \
            -e CI=true \
            node:20-alpine \
            sh -lc "npm run type-check"
        '''
      }
    }

    stage('Unit Tests') {
      steps {
        sh '''
          docker run --rm \
            -v "$PROJECT_DIR":/app \
            -w /app \
            -e CI=true \
            -e AI_DISABLED=true \
            node:20-alpine \
            sh -lc "npm run test"
        '''
      }
    }

    stage('Build') {
      steps {
        sh '''
          docker run --rm \
            -v "$PROJECT_DIR":/app \
            -w /app \
            -e CI=true \
            -e AI_DISABLED=true \
            -e DATABASE_URL="$DATABASE_URL" \
            -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
            -e NEXTAUTH_URL="$NEXTAUTH_URL" \
            node:20-alpine \
            sh -lc "npm run build"
        '''
      }
    }

    stage('Docker Build') {
      steps {
        sh '''
          cd "$PROJECT_DIR"
          docker build -t "$IMAGE_NAME" .
        '''
      }
    }

    stage('Smoke Test') {
      steps {
        sh '''
          docker rm -f newsforge-postgres newsforge-smoke || true

          docker run -d \
            --name newsforge-postgres \
            -e POSTGRES_USER=newsforge \
            -e POSTGRES_PASSWORD=newsforge \
            -e POSTGRES_DB=newsforge_ci \
            -p 5432:5432 \
            postgres:16-alpine

          sleep 15

          docker run -d \
            --name newsforge-smoke \
            -p 3000:3000 \
            -e AI_DISABLED=true \
            -e DATABASE_URL="$DATABASE_URL" \
            -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
            -e NEXTAUTH_URL="$NEXTAUTH_URL" \
            -e CRON_SECRET="$CRON_SECRET" \
            "$IMAGE_NAME"

          sleep 20
          curl -f http://localhost:3000/api/health
        '''
      }
      post {
        always {
          sh 'docker rm -f newsforge-smoke newsforge-postgres || true'
        }
      }
    }

    stage('Archive Artifacts') {
      steps {
        sh '''
          mkdir -p jenkins-artifacts
          cp "$PROJECT_DIR"/README.md jenkins-artifacts/README.md || true
          cp "$PROJECT_DIR"/Jenkinsfile jenkins-artifacts/Jenkinsfile || true
          cp "$PROJECT_DIR"/Dockerfile jenkins-artifacts/Dockerfile || true
          cp "$PROJECT_DIR"/docker-compose.yml jenkins-artifacts/docker-compose.yml || true
          cp "$PROJECT_DIR"/package.json jenkins-artifacts/package.json || true
          cp "$PROJECT_DIR"/prisma/schema.prisma jenkins-artifacts/schema.prisma || true
        '''
        archiveArtifacts artifacts: 'jenkins-artifacts/*', fingerprint: true
      }
    }
  }

  post {
    always {
      sh 'docker image rm "$IMAGE_NAME" || true'
      cleanWs()
    }

    success {
      echo 'Pipeline completed successfully.'
    }

    failure {
      echo 'Pipeline failed. Check logs above.'
    }
  }
}
