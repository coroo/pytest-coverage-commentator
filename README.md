# Pytest Coverage Commentator

A Github action to comments a Pytest Coverage on PR. Please note: this action only available on pull request.

## GitHub Action

The following is an example GitHub Action workflow that uses the Pytest Coverage Commentator to extract the coverage to comment at pull request. Here is an example setup of this action:

```yaml
# This workflow will install dependencies, create coverage tests and run Pytest Coverage Commentator
# For more information see: https://github.com/coroo/pytest-coverage-commentator
name: pytest-coverage-commentator
on:
  pull_request:
    branches: 
      - '*'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python 3.8
      uses: actions/setup-python@v2
      with:
        python-version: 3.8
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install flake8 pytest pytest-cov
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
    - name: Build coverage file
      run: |
        pytest --cache-clear --cov=app test/ > pytest-coverage.txt
    - name: Comment coverage
      uses: coroo/pytest-coverage-commentator@v1.0.0
```

## Action Input

By default, action is designed to run with minimal configuration but you can alter Pytest Coverage Commentator using following action input:

Variable          | Default                                               | Purpose
------------------|-------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------
pytest-coverage   | `pytest-coverage.txt`                                 | File conversion from pytest coverage. It will be used to create a comment.

You can see the action block with all variables as below:

```yml
    - name: pytest-coverage-commentator
      uses: coroo/pytest-coverage-commentator@v1.0.0
      with:
        pytest-coverage: pytest-coverage.txt
```

## Result Example

![coverage-result](/result-coverage.png)
